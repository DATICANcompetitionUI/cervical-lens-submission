import { cn } from "./utils";

type CardVariant = "default" | "elevated" | "flat" | "dark" | "brand";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-surface-container-lowest border border-sand rounded-card",
  elevated: "bg-surface-container-lowest rounded-card shadow-md",
  flat: "rounded-card",
  dark: "bg-on-surface text-inverse-on-surface rounded-card",
  brand: "bg-primary-container text-on-primary-container rounded-card",
};

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn("p-6 font-sans", variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-2xl font-semibold text-on-surface", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-base text-on-surface-variant", className)} {...props}>
      {children}
    </div>
  );
}
