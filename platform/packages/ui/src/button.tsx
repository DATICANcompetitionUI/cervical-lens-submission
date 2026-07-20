import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary font-medium hover:opacity-90 shadow-sm",
  secondary:
    "bg-secondary text-on-secondary font-medium hover:opacity-90 shadow-sm",
  danger:
    "bg-error text-on-error font-medium hover:opacity-90 shadow-sm",
  ghost:
    "bg-transparent text-on-surface hover:bg-surface-container",
  outline:
    "bg-transparent text-on-surface border border-on-surface/60 hover:bg-surface-container-low",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-pill",
  md: "px-6 py-3 text-base rounded-pill",
  lg: "px-8 py-4 text-lg rounded-pill",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
