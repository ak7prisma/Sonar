"use client";

import { useTranslation } from "@/lib/i18n/use-translation";

export function UploadPageHeader() {
  const { t } = useTranslation();

  return (
    <header className="space-y-1.5 text-left">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        {t("scanPageTitle")}
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {t("scanPageDesc")}
      </p>
    </header>
  );
}
