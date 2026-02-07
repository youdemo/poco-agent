"use client";

import { Plus } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { HeaderSearchInput } from "@/components/shared/header-search-input";
import { CapabilityPageHeader } from "@/features/capabilities/components/capability-page-header";

interface SlashCommandsHeaderProps {
  onAddClick?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function SlashCommandsHeader({
  onAddClick,
  searchQuery,
  onSearchChange,
}: SlashCommandsHeaderProps) {
  const { t } = useT("translation");

  return (
    <CapabilityPageHeader
      title={t("library.slashCommands.header.title")}
      actions={
        <>
          <HeaderSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={t("library.slashCommands.searchPlaceholder")}
          />
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onAddClick}
          >
            <Plus className="size-4" />
            {t("library.slashCommands.header.add")}
          </Button>
        </>
      }
    />
  );
}
