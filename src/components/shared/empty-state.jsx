import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-16 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-white text-primary shadow-soft">
          <Icon className="size-7" />
        </div>
      )}
      <h3 className="text-xl font-bold text-ink">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
