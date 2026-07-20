import { cn } from "./utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-on-surface mb-1 font-sans"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full px-4 py-2.5 rounded-input border border-fog bg-surface-container-lowest text-base text-on-surface placeholder-outline",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "font-sans",
          error && "border-error",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-error font-sans">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-on-surface mb-1 font-sans"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "w-full px-4 py-2.5 rounded-input border border-fog bg-surface-container-lowest text-base text-on-surface placeholder-outline",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none",
          "font-sans",
          error && "border-error",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-error font-sans">
          {error}
        </p>
      )}
    </div>
  );
}
