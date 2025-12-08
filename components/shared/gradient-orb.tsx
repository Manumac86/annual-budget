export const GradientOrb = ({
  className = "",
  color = "from-primary/20 to-accent/10",
}: {
  className?: string;
  color?: string;
}) => (
  <div
    className={`absolute rounded-full blur-3xl animate-pulse ${color} ${className}`}
  />
);
