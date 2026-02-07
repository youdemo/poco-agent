"use client";

import { Search } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { HeaderSearchInput } from "@/components/shared/header-search-input";
import { CapabilityPageHeader } from "@/features/capabilities/components/capability-page-header";

interface SkillsHeaderProps {
  onImport?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function SkillsHeader({
  onImport,
  searchQuery,
  onSearchChange,
}: SkillsHeaderProps) {
  const { t } = useT("translation");

  return (
    <CapabilityPageHeader
      title={t("library.skillsPage.header.title")}
      actions={
        <>
          <HeaderSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={t("library.skillsPage.searchPlaceholder")}
          />
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onImport}
          >
            <Search className="size-4" />
            {t("library.skillsImport.title")}
          </Button>
        </>
      }
    />
  );
}
