"use client";

import { useState, useCallback } from "react";
import { CardNav } from "./card-nav";
import { ConnectorsDialog } from "./connectors/connectors-dialog";
import type { ConnectorType } from "../model/connectors";

/**
 * Connectors Bar Entry Component
 *
 * Displays an expandable card that shows MCP, Skill, and Apps sections
 * Clicking on each section opens the connectors dialog with the corresponding tab
 */
export function ConnectorsBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ConnectorType>("app");

  const openDialogWithTab = useCallback((tab: ConnectorType) => {
    setActiveTab(tab);
    setIsOpen(true);
  }, []);

  return (
    <div className="mt-4 w-full">
      <CardNav
        triggerText="将您的工具连接到 Poco"
        onMcpClick={() => openDialogWithTab("mcp")}
        onSkillClick={() => openDialogWithTab("skill")}
        onAppClick={() => openDialogWithTab("app")}
      />
      <ConnectorsDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultTab={activeTab}
      />
    </div>
  );
}
