import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Label + control + error wrapper for react-hook-form.
 * Pass the control as children; give it `id={id}` and `aria-invalid`.
 */
export function FormField({ id, label, error, hint, optional, children, className, labelAction }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-sm font-semibold text-ink">
            {label}
            {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
          </Label>
          {labelAction}
        </div>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
