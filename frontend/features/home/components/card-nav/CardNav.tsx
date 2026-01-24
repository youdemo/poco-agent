"use client";

import { useLayoutEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import {
  Plug,
  Server,
  Sparkles,
  AppWindow,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { mcpService } from "@/features/mcp/services/mcp-service";
import { skillsService } from "@/features/skills/services/skills-service";
import type { McpServer, UserMcpInstall } from "@/features/mcp/types";
import type { Skill, UserSkillInstall } from "@/features/skills/types";
import { useAppShell } from "@/components/shared/app-shell-context";
import "./CardNav.css";

export interface CardNavProps {
  triggerText?: string;
  className?: string;
}

interface InstalledItem {
  id: number;
  name: string;
  enabled: boolean;
  installId: number;
}

/**
 * CardNav Component
 *
 * An expandable card that shows MCP, Skill, and App sections on hover
 * The card content wrap height expands to reveal the 3 module cards sequentially
 */
export function CardNav({
  triggerText = "将您的工具连接到 Poco",
  className = "",
}: CardNavProps) {
  const router = useRouter();
  const { lng } = useAppShell();
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isHoveringRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // API data state
  const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
  const [mcpInstalls, setMcpInstalls] = useState<UserMcpInstall[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillInstalls, setSkillInstalls] = useState<UserSkillInstall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch MCP and Skill data
  const fetchData = useCallback(async () => {
    if (hasFetched || isLoading) return;

    setIsLoading(true);
    try {
      const [mcpServersData, mcpInstallsData, skillsData, skillInstallsData] =
        await Promise.all([
          mcpService.listServers(),
          mcpService.listInstalls(),
          skillsService.listSkills(),
          skillsService.listInstalls(),
        ]);
      setMcpServers(mcpServersData);
      setMcpInstalls(mcpInstallsData);
      setSkills(skillsData);
      setSkillInstalls(skillInstallsData);
      setHasFetched(true);
    } catch (error) {
      console.error("[CardNav] Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched, isLoading]);

  // Get all installed MCPs (both enabled and disabled)
  const installedMcps: InstalledItem[] = mcpInstalls.map((install) => {
    const server = mcpServers.find((s) => s.id === install.server_id);
    return {
      id: install.server_id,
      name: server?.name || `MCP #${install.server_id}`,
      enabled: install.enabled,
      installId: install.id,
    };
  });

  // Get all installed Skills (both enabled and disabled)
  const installedSkills: InstalledItem[] = skillInstalls.map((install) => {
    const skill = skills.find((s) => s.id === install.skill_id);
    return {
      id: install.skill_id,
      name: skill?.name || `Skill #${install.skill_id}`,
      enabled: install.enabled,
      installId: install.id,
    };
  });

  // Toggle MCP enabled state
  const toggleMcpEnabled = useCallback(
    async (installId: number, currentEnabled: boolean) => {
      try {
        await mcpService.updateInstall(installId, { enabled: !currentEnabled });
        setMcpInstalls((prev) =>
          prev.map((install) =>
            install.id === installId
              ? { ...install, enabled: !currentEnabled }
              : install,
          ),
        );
      } catch (error) {
        console.error("[CardNav] Failed to toggle MCP:", error);
      }
    },
    [],
  );

  // Toggle Skill enabled state
  const toggleSkillEnabled = useCallback(
    async (installId: number, currentEnabled: boolean) => {
      try {
        await skillsService.updateInstall(installId, {
          enabled: !currentEnabled,
        });
        setSkillInstalls((prev) =>
          prev.map((install) =>
            install.id === installId
              ? { ...install, enabled: !currentEnabled }
              : install,
          ),
        );
      } catch (error) {
        console.error("[CardNav] Failed to toggle Skill:", error);
      }
    },
    [],
  );

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;
    const cards = cardsRef.current.filter(Boolean);
    if (!navEl) return null;

    // Initial state
    gsap.set(navEl, { height: 48 });
    gsap.set(cards, { opacity: 0, scale: 0.95, y: 15 });

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power2.out" },
    });

    // 1. Expand the container height to auto
    tl.to(navEl, {
      height: "auto",
      duration: 0.15,
    });

    // 2. Staggered sequence for the cards to "appear in order"
    tl.to(
      cards,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.25,
        stagger: 0.08,
      },
      "-=0.25",
    );

    return tl;
  }, []);

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [createTimeline]);

  const openMenu = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (!isExpanded) {
      setIsExpanded(true);
      fetchData();

      requestAnimationFrame(() => {
        if (!tlRef.current) {
          tlRef.current = createTimeline();
        }
        tlRef.current?.play(0);
      });
    }
  }, [isExpanded, fetchData, createTimeline]);

  const closeMenu = useCallback(() => {
    const tl = tlRef.current;
    if (!tl || !isExpanded) return;

    tl.reverse();
    tl.eventCallback("onReverseComplete", () => {
      setIsExpanded(false);
    });
  }, [isExpanded]);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    openMenu();
  }, [openMenu]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    closeTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        closeMenu();
      }
    }, 50);
  }, [closeMenu]);

  const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
    cardsRef.current[index] = el;
  };

  const handleLabelClick = useCallback(
    (e: React.MouseEvent, path: string) => {
      e.stopPropagation();
      router.push(`/${lng}/${path}?from=home`);
    },
    [router, lng],
  );

  const renderItemBadges = (
    items: InstalledItem[],
    emptyText: string,
    type: "mcp" | "skill",
  ) => {
    if (isLoading) {
      return (
        <div className="nav-card-loading">
          <Loader2 className="size-3 animate-spin" />
          <span>同步中...</span>
        </div>
      );
    }

    if (items.length === 0) {
      return <span className="nav-card-empty">{emptyText}</span>;
    }

    const toggleFn = type === "mcp" ? toggleMcpEnabled : toggleSkillEnabled;

    return (
      <div className="nav-card-scrollable-list">
        {items.map((item) => (
          <button
            key={item.id}
            className={`nav-card-item ${item.enabled ? "nav-card-item--enabled" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFn(item.installId, item.enabled);
            }}
            type="button"
          >
            <span
              className={`nav-card-item-dot ${item.enabled ? "nav-card-item-dot--active" : ""}`}
            />
            <span className="nav-card-item-name">{item.name}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Entry Bar */}
        <div
          className="card-nav-top"
          role="button"
          aria-expanded={isExpanded}
          tabIndex={0}
        >
          <Plug className="card-nav-top-icon" />
          <span className="card-nav-top-text">{triggerText}</span>
        </div>

        {/* Modular Content */}
        <div ref={contentRef} className="card-nav-content-wrap">
          <div className="card-nav-content">
            {/* 1. MCP */}
            <div
              ref={setCardRef(0)}
              className="nav-card nav-card--mcp"
              role="button"
              tabIndex={isExpanded ? 0 : -1}
            >
              <div className="nav-card-header">
                <div className="nav-card-icon">
                  <Server />
                </div>
                <button
                  className="nav-card-label-button"
                  onClick={(e) => handleLabelClick(e, "capabilities/mcp")}
                  type="button"
                >
                  <span className="nav-card-label">MCP</span>
                  <ChevronRight className="nav-card-label-chevron" size={14} />
                </button>
              </div>
              {renderItemBadges(installedMcps, "未安装 MCP", "mcp")}
            </div>

            {/* 2. Skill */}
            <div
              ref={setCardRef(1)}
              className="nav-card nav-card--skill"
              role="button"
              tabIndex={isExpanded ? 0 : -1}
            >
              <div className="nav-card-header">
                <div className="nav-card-icon">
                  <Sparkles />
                </div>
                <button
                  className="nav-card-label-button"
                  onClick={(e) => handleLabelClick(e, "capabilities/skills")}
                  type="button"
                >
                  <span className="nav-card-label">Skill</span>
                  <ChevronRight className="nav-card-label-chevron" size={14} />
                </button>
              </div>
              {renderItemBadges(installedSkills, "未安装技能", "skill")}
            </div>

            {/* 3. App */}
            <div
              ref={setCardRef(2)}
              className="nav-card nav-card--app"
              role="button"
              tabIndex={isExpanded ? 0 : -1}
            >
              <div className="nav-card-header">
                <div className="nav-card-icon">
                  <AppWindow />
                </div>
                <span className="nav-card-label">应用</span>
              </div>
              <span className="nav-card-empty">即将推出</span>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default CardNav;
