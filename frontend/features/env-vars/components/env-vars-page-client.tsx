"use client";

import { useState } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/sidebar/app-sidebar";

import { EnvVarsHeader } from "@/features/env-vars/components/env-vars-header";
import { EnvVarsGrid } from "@/features/env-vars/components/env-vars-grid";
import {
  AddEnvVarDialog,
  type EnvVarDialogMode,
} from "@/features/env-vars/components/add-env-var-dialog";

import { useProjects } from "@/features/projects/hooks/use-projects";
import { useTaskHistory } from "@/features/projects/hooks/use-task-history";
import { useEnvVarsStore } from "@/features/env-vars/hooks/use-env-vars-store";
import { SettingsDialog } from "@/features/settings/components/settings-dialog";
import type { EnvVar } from "@/features/env-vars/types";

export function EnvVarsPageClient() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<EnvVarDialogMode>("create");
  const [dialogInitialKey, setDialogInitialKey] = useState<string | undefined>(
    undefined,
  );
  const [dialogInitialDesc, setDialogInitialDesc] = useState<
    string | null | undefined
  >(undefined);
  const { projects, addProject, updateProject } = useProjects({});
  const { taskHistory, removeTask } = useTaskHistory({});
  const envVarStore = useEnvVarsStore();

  const handleRenameProject = (projectId: string, newName: string) => {
    updateProject(projectId, { name: newName });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full overflow-hidden bg-background">
        <AppSidebar
          projects={projects}
          taskHistory={taskHistory}
          onNewTask={() => {}}
          onDeleteTask={removeTask}
          onCreateProject={addProject}
          onRenameProject={handleRenameProject}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <SidebarInset className="flex flex-col bg-muted/30">
          <EnvVarsHeader
            onAddClick={() => {
              setDialogMode("create");
              setDialogInitialKey(undefined);
              setDialogInitialDesc(undefined);
              setIsAddDialogOpen(true);
            }}
          />

          <div className="flex flex-1 flex-col px-6 py-6">
            <div className="w-full max-w-6xl mx-auto">
              {envVarStore.isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/20" />
                </div>
              ) : (
                <EnvVarsGrid
                  envVars={envVarStore.envVars}
                  savingKey={envVarStore.savingEnvKey}
                  onDelete={(id) => {
                    envVarStore.removeEnvVar(id);
                  }}
                  onEdit={(envVar: EnvVar) => {
                    setDialogMode("edit");
                    setDialogInitialKey(envVar.key);
                    setDialogInitialDesc(envVar.description);
                    setIsAddDialogOpen(true);
                  }}
                  onOverrideSystem={(key: string) => {
                    const existingUser = envVarStore.envVars.find(
                      (v) => v.scope === "user" && v.key === key,
                    );
                    if (existingUser) {
                      setDialogMode("edit");
                      setDialogInitialKey(existingUser.key);
                      setDialogInitialDesc(existingUser.description);
                      setIsAddDialogOpen(true);
                      return;
                    }
                    setDialogMode("override");
                    setDialogInitialKey(key);
                    setDialogInitialDesc(undefined);
                    setIsAddDialogOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        </SidebarInset>

        <SettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
        />

        <AddEnvVarDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          mode={dialogMode}
          initialKey={dialogInitialKey}
          initialDescription={dialogInitialDesc}
          onSave={async (payload) => {
            await envVarStore.upsertEnvVar(payload);
          }}
          isSaving={envVarStore.savingEnvKey !== null}
        />
      </div>
    </SidebarProvider>
  );
}
