import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

/** Page title block: optional back link, one H1, one sentence of context, actions. */
export function PageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm font-medium text-secondary-foreground hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>{backLabel ?? "Kembali"}</span>
        </Link>
      ) : null}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 space-y-1.5">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
