"use client";

import { Plus } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { CapabilityPageHeader } from "@/features/capabilities/components/capability-page-header";

interface EnvVarsHeaderProps {
  onAddClick?: () => void;
}

export function EnvVarsHeader({ onAddClick }: EnvVarsHeaderProps) {
  const { t } = useT("translation");

  return (
    <CapabilityPageHeader
      title={t("library.envVars.header.title")}
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={onAddClick}
        >
          <Plus className="size-4" />
          {t("library.envVars.header.add")}
        </Button>
      }
    />
  );
}
