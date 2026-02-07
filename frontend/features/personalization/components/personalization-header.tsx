"use client";

import { Save, Trash2 } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { CapabilityPageHeader } from "@/features/capabilities/components/capability-page-header";

interface PersonalizationHeaderProps {
  onSave?: () => void;
  onClear?: () => void;
  isSaving?: boolean;
  isLoading?: boolean;
}

export function PersonalizationHeader({
  onSave,
  onClear,
  isSaving,
  isLoading,
}: PersonalizationHeaderProps) {
  const { t } = useT("translation");

  return (
    <CapabilityPageHeader
      title={t("library.personalization.header.title")}
      actions={
        <>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onClear}
            disabled={isLoading || isSaving}
          >
            <Trash2 className="size-4" />
            {t("library.personalization.header.clear")}
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={onSave}
            disabled={isLoading || isSaving}
          >
            <Save className="size-4" />
            {isSaving
              ? t("library.personalization.header.saving")
              : t("library.personalization.header.save")}
          </Button>
        </>
      }
    />
  );
}
