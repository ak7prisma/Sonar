import { cn } from "cn";

interface PanelProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  /** Stable id used to label the region for assistive technology. */
  id?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/**
 * Standard content surface for the signed-in workspace: white card, soft
 * border, optional heading row. Renders a labelled <section> when titled.
 */
export function Panel({
  title,
  description,
  action,
  id,
  className,
  bodyClassName,
  children,
}: PanelProps) {
  const headingId = title && id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-card",
        className
      )}
    >
      {title ? (
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2
              id={headingId}
              className="font-heading text-lg font-bold tracking-tight text-foreground"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("px-5 pb-5 sm:px-6 sm:pb-6", title ? "pt-4" : "pt-5 sm:pt-6", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
