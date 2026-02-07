"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

import { SkillsHeader } from "@/features/skills/components/skills-header";
import { SkillsGrid } from "@/features/skills/components/skills-grid";
import { SkillImportDialog } from "@/features/skills/components/skill-import-dialog";
import { useSkillCatalog } from "@/features/skills/hooks/use-skill-catalog";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { PaginatedGrid } from "@/components/ui/paginated-grid";
import { usePagination } from "@/hooks/use-pagination";
import { skillsService } from "@/features/skills/services/skills-service";
import { useT } from "@/lib/i18n/client";
import { CapabilityContentShell } from "@/features/capabilities/components/capability-content-shell";

const PAGE_SIZE = 10;

export function SkillsPageClient() {
  const { t } = useT("translation");
  const {
    skills,
    installs,
    loadingId,
    isLoading,
    installSkill,
    uninstallSkill,
    setEnabled,
    refresh,
  } = useSkillCatalog();
  const [importOpen, setImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSkills = useMemo(() => {
    if (!searchQuery) return skills;
    const lowerQuery = searchQuery.toLowerCase();
    return skills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(lowerQuery) ||
        String(skill.id).includes(lowerQuery),
    );
  }, [skills, searchQuery]);

  const pagination = usePagination(filteredSkills, { pageSize: PAGE_SIZE });

  // Batch toggle all skills
  const handleBatchToggle = useCallback(
    async (enabled: boolean) => {
      try {
        await Promise.all(
          installs.map((install) =>
            skillsService.updateInstall(install.id, { enabled }),
          ),
        );
        // Refresh the installs list
        refresh();
      } catch (error) {
        console.error("[SkillsPageClient] Failed to batch toggle:", error);
        toast.error(t("library.skillsManager.toasts.actionFailed"));
      }
    },
    [installs, refresh, t],
  );

  return (
    <>
      <SkillsHeader
        onImport={() => setImportOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <PullToRefresh onRefresh={refresh} isLoading={isLoading}>
          <CapabilityContentShell>
            <PaginatedGrid
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              onPageChange={pagination.goToPage}
              onPageSizeChange={pagination.setPageSize}
              totalItems={filteredSkills.length}
            >
              <SkillsGrid
                skills={pagination.paginatedData}
                installs={installs}
                loadingId={loadingId}
                isLoading={isLoading}
                onInstall={installSkill}
                onUninstall={uninstallSkill}
                onToggleEnabled={setEnabled}
                onBatchToggle={handleBatchToggle}
                totalCount={filteredSkills.length}
              />
            </PaginatedGrid>
          </CapabilityContentShell>
        </PullToRefresh>
      </div>

      <SkillImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={refresh}
      />
    </>
  );
}
