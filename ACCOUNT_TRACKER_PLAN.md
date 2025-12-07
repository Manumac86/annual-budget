# Account Tracker - Comprehensive Implementation Plan

Based on the Annual_Budget.xlsx Account sheet, we need to implement a complete account tracking system.

## Current Implementation (Basic)
✅ Account CRUD (Create, Read, Update, Delete)
✅ Account types: checking, savings, credit, investment, other
✅ Starting balance per account
✅ Net worth calculation (assets - liabilities)

## Missing Features (From Excel)

### 1. Transaction-Account Linking
**Requirement**: Every transaction must be linked to an account
- Add `accountId` field to Transaction model
- Add `accountName` field to Transaction model (for display)
- Make account selection **optional initially** to avoid breaking existing transactions
- Update Transaction form to include account selector
- Update all transaction APIs to handle accountId

### 2. Account Transaction Types
**Requirement**: Support different transaction types in accounts

#### Standard Transactions:
- **IN**: Money coming into account (income, deposits)
  - Maps to existing `type: "income"` transactions
  - Example: Salary deposit, refund

- **OUT**: Money going out (expenses, withdrawals)
  - Maps to existing `type: "expense"` transactions
  - Example: Bill payment, ATM withdrawal

#### New Transaction Types:
- **Transfer**: Move money between accounts
  - Create special transaction type: `type: "transfer"`
  - Requires: source account, destination account, amount
  - Creates two linked transactions (debit from source, credit to destination)
  - Net effect on budget: $0 (internal movement)

- **Interest**: Interest earned or charged
  - Create special transaction type: `type: "interest"`
  - Positive for savings accounts, negative for debt accounts
  - May or may not affect budget categories

- **Adjustment**: Manual balance corrections
  - Create special transaction type: `type: "adjustment"`
  - For correcting discrepancies
  - May or may not affect budget

### 3. Monthly Account View
**Requirement**: Show account activity for a selected month

For each account, display:
```
Account Name | Type | Start Balance | IN | OUT | Transfer | Interest | Adjustment | Current Balance
```

Calculations:
- **Start Balance**: Account balance at start of month (or initial balance if first month)
- **IN**: Sum of all income transactions for this account this month
- **OUT**: Sum of all expense transactions for this account this month
- **Transfer**: Net transfers (incoming - outgoing) for this month
- **Interest**: Sum of interest transactions for this month
- **Adjustment**: Sum of adjustment transactions for this month
- **Current Balance**: Start Balance + IN - OUT + Transfer + Interest + Adjustment

### 4. Account Transaction Management UI
**Requirement**: Interface to create special account transactions

Need forms for:
1. **Transfer Form**:
   - From Account (dropdown)
   - To Account (dropdown)
   - Amount
   - Date
   - Description (optional)

2. **Interest Form**:
   - Account (dropdown)
   - Amount (can be negative for charges)
   - Date
   - Description

3. **Adjustment Form**:
   - Account (dropdown)
   - Amount (can be positive or negative)
   - Date
   - Reason (description)

## Implementation Steps

### Phase 1: Data Model Updates
1. ✅ Update Transaction type to add optional `accountId` and `accountName`
2. ✅ Add new transaction types: "transfer", "interest", "adjustment"
3. ✅ Create AccountTransaction type for special transactions
4. ✅ Update validation schemas

### Phase 2: Transaction-Account Integration
1. Update Transaction API to handle accountId
2. Update TransactionForm to include account selector (optional)
3. Update transaction display to show account name
4. Migration strategy for existing transactions (they'll have null accountId initially)

### Phase 3: Special Transaction Types
1. Create Transfer API endpoint
2. Create Interest API endpoint
3. Create Adjustment API endpoint
4. Create forms for each transaction type
5. Handle transfer as dual transactions (source and destination)

### Phase 4: Account Tracker View Enhancement
1. Add month selector to Accounts page
2. Create AccountMonthlyView component showing the table
3. Calculate monthly balances per account
4. Display IN/OUT/Transfer/Interest/Adjustment columns
5. Add forms to create special transactions directly from account view

### Phase 5: Account Balance Tracking
1. Create method to calculate account balance at any point in time
2. Add historical balance tracking
3. Create account balance timeline/chart (optional enhancement)

## Technical Considerations

### Backward Compatibility
- Existing transactions don't have accountId → make it optional
- Provide UI to link existing transactions to accounts (batch edit feature)
- Allow filtering "unlinked transactions" to assign them to accounts

### Transfer Transaction Handling
- Create two transaction records linked by `transferId`
- One debit (OUT) from source account
- One credit (IN) to destination account
- Both share same `transferId` for reconciliation
- Deletion of transfer should delete both transactions

### Database Schema
```typescript
interface Transaction {
  // ... existing fields
  accountId?: ObjectId;  // Optional - linked account
  accountName?: string;  // Cached account name
  transactionType?: "standard" | "transfer" | "interest" | "adjustment";
  transferId?: ObjectId; // Links paired transfer transactions
  transferDirection?: "in" | "out"; // For transfers
}

interface AccountTransaction {
  _id: ObjectId;
  budgetId: ObjectId;
  accountId: ObjectId;
  accountName: string;
  type: "transfer" | "interest" | "adjustment";
  amount: number;
  date: Date;
  month: number;
  year: number;
  description?: string;

  // For transfers only
  transferToAccountId?: ObjectId;
  transferToAccountName?: string;
  transferId?: ObjectId; // Links the pair

  createdAt: Date;
  updatedAt: Date;
}
```

## UI/UX Flow

### Main Accounts Page
- Show list of all accounts with current balances
- Add "Month View" button → opens monthly detail view
- Add "Account Transactions" tab to manage transfers/interest/adjustments

### Monthly Account View
- Month selector dropdown
- Table showing all accounts with monthly breakdown
- Quick action buttons: Add Transfer, Add Interest, Add Adjustment
- Total row at bottom showing portfolio summary

### Transaction Forms (Month view)
- Add "Account" dropdown field (optional, with "None" option)
- Show account balance after transaction (preview)
- Validate sufficient funds for expenses/transfers

## Testing Scenarios
1. Create account with starting balance
2. Add regular income transaction linked to account
3. Add regular expense transaction linked to account
4. Transfer money between two accounts
5. Add interest to savings account
6. Add manual adjustment
7. View monthly account summary
8. Verify balance calculations are correct
9. Test transfer deletion (both records removed)
10. Test backward compatibility with transactions without accountId

## Future Enhancements
- Account reconciliation feature (match to bank statements)
- Import transactions from bank (CSV, OFX)
- Multi-currency account support
- Account categories/groups
- Spending by account reports
- Account balance history chart
