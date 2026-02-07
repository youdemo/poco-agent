"use client";

import { Plus } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { HeaderSearchInput } from "@/components/shared/header-search-input";
import { CapabilityPageHeader } from "@/features/capabilities/components/capability-page-header";

interface SubAgentsHeaderProps {
  onAddClick?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function SubAgentsHeader({
  onAddClick,
  searchQuery,
  onSearchChange,
}: SubAgentsHeaderProps) {
  const { t } = useT("translation");

  return (
    <CapabilityPageHeader
      title={t("library.subAgents.header.title")}
      actions={
        <>
          <HeaderSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={t("library.subAgents.searchPlaceholder")}
          />
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onAddClick}
          >
            <Plus className="size-4" />
            {t("library.subAgents.header.add")}
          </Button>
        </>
      }
    />
  );
}
