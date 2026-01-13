"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, FolderPlus, Trash2 } from "lucide-react";

import { useT } from "@/app/i18n/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { TASK_STATUS_META } from "../model/constants";
import type { TaskHistoryItem } from "../model/types";

export function TaskHistoryList({
  tasks,
  onDeleteTask,
}: {
  tasks: TaskHistoryItem[];
  onDeleteTask: (taskId: string) => void;
}) {
  const { t } = useT("translation");

  return (
    <SidebarMenu className="gap-0.5">
      {tasks.map((task) => {
        const statusMeta = TASK_STATUS_META[task.status];

        return (
          <SidebarMenuItem key={task.id}>
            <SidebarMenuButton
              className="group relative h-[36px] w-full min-w-0 max-w-full justify-start gap-3 rounded-[10px] px-3 py-[7.5px] text-left transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              tooltip={task.title}
            >
              {/* 第一栏：色点 */}
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  statusMeta.dotClassName,
                )}
                aria-hidden="true"
              />
              <span className="sr-only">{t(statusMeta.labelKey)}</span>
              {/* 第二栏：文字（可截断） */}
              <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm group-data-[collapsible=icon]:hidden">
                {task.title}
              </span>
              {/* 第三栏：更多按钮 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        (e.currentTarget as HTMLElement).click();
                      }
                    }}
                    className="shrink-0 size-5 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100 group-data-[collapsible=icon]:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement rename functionality
                    }}
                  >
                    <Pencil className="size-4" />
                    <span>{t("sidebar.rename")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement move to project functionality
                    }}
                  >
                    <FolderPlus className="size-4" />
                    <span>{t("sidebar.moveToProject")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                    <span>{t("sidebar.delete")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
