import { cn } from "./utils";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-8 h-8 text-caption",
  md: "w-10 h-10 text-body-sm",
  lg: "w-12 h-12 text-body-lg",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-semibold font-sans border border-sand",
        sizeStyles[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
