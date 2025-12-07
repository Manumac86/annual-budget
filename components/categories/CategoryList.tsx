"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryEditForm } from "./CategoryEditForm";
import { useCategoryMutations } from "@/hooks/useCategoryMutations";
import type { SerializableIncomeCategory, SerializableExpenseCategory } from "@/types";

interface CategoryListProps {
  categories: (SerializableIncomeCategory | SerializableExpenseCategory)[];
  type: "income" | "expense";
  budgetId: string;
  currencySymbol: string;
  onUpdate?: () => void;
}

interface SortableItemProps {
  category: SerializableIncomeCategory | SerializableExpenseCategory;
  type: "income" | "expense";
  currencySymbol: string;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableItem({
  category,
  type,
  currencySymbol,
  onEdit,
  onDelete,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category._id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isExpenseCategory = (cat: any): cat is SerializableExpenseCategory => {
    return "category" in cat;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 flex items-center gap-4"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{category.name}</h4>
            {isExpenseCategory(category) && (
              <p className="text-sm text-muted-foreground capitalize">
                {category.category}
              </p>
            )}
          </div>
          <p className="text-lg font-semibold">
            {currencySymbol}
            {category.projectedAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          title="Edit category"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          title="Archive category"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

export function CategoryList({
  categories,
  type,
  budgetId,
  currencySymbol,
  onUpdate,
}: CategoryListProps) {
  const [items, setItems] = useState(categories);
  const [editingCategory, setEditingCategory] = useState<
    SerializableIncomeCategory | SerializableExpenseCategory | null
  >(null);
  const [deletingCategory, setDeletingCategory] = useState<
    SerializableIncomeCategory | SerializableExpenseCategory | null
  >(null);

  const {
    reorderIncomeCategories,
    reorderExpenseCategories,
    archiveIncomeCategory,
    archiveExpenseCategory,
  } = useCategoryMutations();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(
        (item) => item._id.toString() === active.id
      );
      const newIndex = items.findIndex(
        (item) => item._id.toString() === over.id
      );

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update order in backend
      try {
        const reorderedCategories = newItems.map((item, index) => ({
          id: item._id.toString(),
          order: index,
        }));

        if (type === "income") {
          await reorderIncomeCategories(budgetId, reorderedCategories);
        } else {
          await reorderExpenseCategories(budgetId, reorderedCategories);
        }

        if (onUpdate) onUpdate();
      } catch (error) {
        console.error("Error reordering categories:", error);
        // Revert on error
        setItems(categories);
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      if (type === "income") {
        await archiveIncomeCategory(deletingCategory._id.toString());
      } else {
        await archiveExpenseCategory(deletingCategory._id.toString());
      }

      setDeletingCategory(null);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error("Error archiving category:", error);
      alert(error.message || "Failed to archive category");
    }
  };

  // Update items when categories prop changes
  useState(() => {
    setItems(categories);
  });

  if (categories.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No {type} categories yet. Add some in the setup page.
        </p>
      </Card>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item._id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((category) => (
              <SortableItem
                key={category._id.toString()}
                category={category}
                type={type}
                currencySymbol={currencySymbol}
                onEdit={() => setEditingCategory(category)}
                onDelete={() => setDeletingCategory(category)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editingCategory && (
        <CategoryEditForm
          category={editingCategory}
          type={type}
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          onSuccess={() => {
            setEditingCategory(null);
            if (onUpdate) onUpdate();
          }}
          currencySymbol={currencySymbol}
        />
      )}

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{deletingCategory?.name}"? This
              will hide it from your budget, but existing transactions will
              remain unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
