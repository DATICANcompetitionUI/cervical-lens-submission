import { cn } from "./utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "brand";
}

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold font-sans",
        variant === "outline"
          ? "border border-on-surface/40 text-on-surface bg-transparent"
          : variant === "brand"
            ? "bg-primary-container text-on-primary-container"
            : "bg-surface-container-high text-on-surface-variant",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
