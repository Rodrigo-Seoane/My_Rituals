import { TaskCategory, CATEGORY_META } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: TaskCategory;
  className?: string;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, className, size = "sm" }: CategoryBadgeProps) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
      style={{ backgroundColor: meta.bg, color: meta.text }}
    >
      {meta.label}
    </span>
  );
}

interface CategoryDotProps {
  category: TaskCategory;
  className?: string;
}

export function CategoryDot({ category, className }: CategoryDotProps) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full flex-shrink-0", className)}
      style={{ backgroundColor: meta.color }}
    />
  );
}
