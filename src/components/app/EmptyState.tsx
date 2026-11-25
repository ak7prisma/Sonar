import { cn } from "cn";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Quiet empty/zero state: one icon, one sentence, one next step. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center",
        className
      )}
    >
      {Icon ? (
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-mint text-brand-teal">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="font-heading text-base font-bold text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
