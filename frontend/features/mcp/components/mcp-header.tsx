"use client";

import { Plus } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { HeaderSearchInput } from "@/components/shared/header-search-input";
import { CapabilityPageHeader } from "@/features/capabilities/components/capability-page-header";

interface McpHeaderProps {
  onOpenSettings?: () => void;
  onAddMcp?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function McpHeader({
  onAddMcp,
  searchQuery,
  onSearchChange,
}: McpHeaderProps) {
  const { t } = useT("translation");

  return (
    <CapabilityPageHeader
      title={t("library.mcpLibrary.header.title")}
      actions={
        <>
          <HeaderSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={t("library.mcpLibrary.searchPlaceholder")}
          />
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onAddMcp}
          >
            <Plus className="size-4" />
            {t("library.mcpLibrary.header.add")}
          </Button>
        </>
      }
    />
  );
}
