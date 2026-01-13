"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Library,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useT } from "@/app/i18n/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import type { ProjectItem, TaskHistoryItem } from "../model/types";
import { TaskHistoryList } from "./task-history-list";

const TOP_NAV_ITEMS = [
  { id: "search", labelKey: "sidebar.search", icon: Search },
  { id: "library", labelKey: "sidebar.library", icon: Library },
] as const;

// TODO: 侧边栏回收的时候， Icon 会有抖动

export function HomeSidebar({
  projects,
  taskHistory,
  onNewTask,
  onDeleteTask,
}: {
  projects: ProjectItem[];
  taskHistory: TaskHistoryItem[];
  onNewTask: () => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const { t } = useT("translation");
  const { toggleSidebar } = useSidebar();
  const [isTasksCollapsed, setIsTasksCollapsed] = React.useState(false);
  const [isProjectsCollapsed, setIsProjectsCollapsed] = React.useState(false);

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-sidebar">
      <SidebarHeader className="gap-2 pb-2">
        {/* Logo 和折叠按钮 */}
        <div className="mb-3 flex items-center justify-between pt-2 group-data-[collapsible=icon]:justify-start">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
            {/* 折叠状态下：默认显示 Logo，悬停显示展开按钮 */}
            <button
              onClick={toggleSidebar}
              className="group/logo flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground transition-colors hover:bg-sidebar-primary/90"
              type="button"
            >
              <MessageSquare className="size-4 group-data-[collapsible=icon]:group-hover/logo:hidden" />
              <PanelLeftOpen className="hidden size-4 group-data-[collapsible=icon]:group-hover/logo:block" />
            </button>
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              OpenCoWork
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="size-8 text-sidebar-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        </div>

        {/* 新建任务按钮 */}
        <SidebarMenu className="group-data-[collapsible=icon]:px-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onNewTask}
              className="h-[36px] justify-start gap-3 rounded-[10px] px-3 py-[7.5px] text-muted-foreground transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              tooltip={t("sidebar.newTask")}
            >
              <PenSquare className="size-4" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">{t("sidebar.newTask")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {TOP_NAV_ITEMS.map(({ id, labelKey, icon: Icon }) => (
          <SidebarMenu key={id} className="group-data-[collapsible=icon]:px-0">
            <SidebarMenuItem>
              <SidebarMenuButton
                className="h-[36px] justify-start gap-3 rounded-[10px] px-3 py-[7.5px] text-muted-foreground transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                tooltip={t(labelKey)}
              >
                <Icon className="size-4" />
                <span className="text-sm group-data-[collapsible=icon]:hidden">{t(labelKey)}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ))}
      </SidebarHeader>

      <SidebarContent className="group-data-[collapsible=icon]:px-0">
        <ScrollArea className="h-full">
          {/* 项目 */}
          <SidebarGroup className="py-2 group-data-[collapsible=icon]:hidden">
            <div className="group/projects-header flex items-center justify-between pr-2">
              <div className="flex items-center gap-0.5">
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                  {t("sidebar.projects")}
                </SidebarGroupLabel>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProjectsCollapsed(!isProjectsCollapsed);
                  }}
                  className="size-5 text-muted-foreground hover:bg-sidebar-accent opacity-0 transition-opacity group-hover/projects-header:opacity-100 group-data-[collapsible=icon]:opacity-100"
                >
                  {isProjectsCollapsed ? (
                    <ChevronRight className="size-3 transition-transform" />
                  ) : (
                    <ChevronDown className="size-3 transition-transform" />
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 text-muted-foreground hover:bg-sidebar-accent"
              >
                <Plus className="size-3" />
              </Button>
            </div>
            {!isProjectsCollapsed && (
              <SidebarGroupContent className="mt-1 group-data-[collapsible=icon]:mt-0">
                <SidebarMenu>
                  {projects.map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        className="h-8 justify-start gap-3 text-sm hover:bg-sidebar-accent"
                        tooltip={project.name}
                      >
                        <Folder className="size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                        <span>{project.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>

          {/* 所有任务 */}
          <SidebarGroup className="py-2 group-data-[collapsible=icon]:hidden">
            <div className="group/tasks-header flex items-center justify-between pr-2">
              <div className="flex items-center gap-0.5">
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                  {t("sidebar.allTasks")}
                </SidebarGroupLabel>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTasksCollapsed(!isTasksCollapsed);
                  }}
                  className="size-5 text-muted-foreground hover:bg-sidebar-accent opacity-0 transition-opacity group-hover/tasks-header:opacity-100 group-data-[collapsible=icon]:opacity-100"
                >
                  {isTasksCollapsed ? (
                    <ChevronRight className="size-3 transition-transform" />
                  ) : (
                    <ChevronDown className="size-3 transition-transform" />
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 text-muted-foreground hover:bg-sidebar-accent"
              >
                <SlidersHorizontal className="size-3" />
              </Button>
            </div>
            {!isTasksCollapsed && (
              <SidebarGroupContent className="mt-1 group-data-[collapsible=icon]:mt-0">
                <TaskHistoryList
                  tasks={taskHistory}
                  onDeleteTask={onDeleteTask}
                />
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 group-data-[collapsible=icon]:p-2">
        {/* 底部工具栏 */}
        <div className="flex items-center justify-start px-1 group-data-[collapsible=icon]:px-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:bg-sidebar-accent"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8 text-muted-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
