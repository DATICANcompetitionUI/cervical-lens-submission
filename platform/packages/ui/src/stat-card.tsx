import { cn } from "./utils";

type StatVariant = "default" | "warning" | "danger" | "success";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: StatVariant;
}

const iconBgStyles: Record<StatVariant, string> = {
  default: "bg-surface-container-high text-tertiary",
  warning: "bg-secondary-container/20 text-secondary",
  danger: "bg-error-container text-on-error-container",
  success: "bg-primary-container/30 text-on-primary-container",
};

const valueStyles: Record<StatVariant, string> = {
  default: "text-on-surface",
  warning: "text-secondary",
  danger: "text-error",
  success: "text-primary",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}: StatCardProps) {
  return (
    <div className="rounded-card bg-surface-container-lowest border border-fog/30 p-4 flex flex-col justify-between font-sans">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", iconBgStyles[variant])}>
        {icon}
      </div>
      <div className="mt-auto">
        <p className={cn("text-2xl font-bold tracking-tight", valueStyles[variant])}>{value}</p>
        <p className="text-xs text-steel font-medium mt-1">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-outline">{subtitle}</p>}
      </div>
    </div>
  );
}
