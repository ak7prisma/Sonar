"use client";

import { PageHeader } from "@/components/app/PageHeader";
import { useTranslation } from "@/lib/i18n/use-translation";

export function SettingsPageHeader() {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t("settingsPageTitle")}
      description={t("settingsPageDesc")}
    />
  );
}
