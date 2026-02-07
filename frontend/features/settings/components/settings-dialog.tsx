"use client";

import { useTheme } from "next-themes";
import { useUserAccount } from "@/features/user/hooks/use-user-account";
import { useT } from "@/lib/i18n/client";

import * as React from "react";
import {
  User,
  Settings,
  Activity,
  ExternalLink,
  HelpCircle,
  UserCog,
  Sparkles,
  RefreshCw,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { t } = useT("translation");
  const [activeTab, setActiveTab] = React.useState("account");
  const { profile, credits, isLoading } = useUserAccount();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const SIDEBAR_ITEMS = [
    { icon: User, label: t("settings.sidebar.account"), id: "account" },
    { icon: Settings, label: t("settings.sidebar.settings"), id: "settings" },
    { icon: Activity, label: t("settings.sidebar.usage"), id: "usage" },
  ];

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="flex-1 overflow-y-auto p-5">
            {/* User Profile Card */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="size-14 bg-primary">
                <AvatarFallback className="text-xl text-primary-foreground bg-primary">
                  {profile?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <div className="text-base font-medium truncate">
                      {profile?.email}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {profile?.id}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="size-8">
                  <UserCog className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-8">
                  <ExternalLink className="size-4" />
                </Button>
              </div>
            </div>

            {/* Plan Card */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-border border-dashed">
                <span className="font-medium">{profile?.planName}</span>
                <Button
                  size="sm"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-4 text-xs font-bold"
                >
                  {t("settings.upgrade")}
                </Button>
              </div>
              <div className="p-4 space-y-5">
                {/* Credits */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="size-4" />
                      <span className="text-sm font-medium">
                        {t("settings.credits")}
                      </span>
                      <HelpCircle className="size-3.5 opacity-50" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                      {credits?.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground/60 pl-6">
                    <span>{t("settings.freeCredits")}</span>
                    <span>{credits?.free}</span>
                  </div>
                </div>

                {/* Daily Refresh */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <RefreshCw className="size-4" />
                      <span className="text-sm font-medium">
                        {t("settings.dailyRefresh")}
                      </span>
                      <HelpCircle className="size-3.5 opacity-50" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                      {credits?.dailyRefreshCurrent}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground/60 pl-6">
                    {t("settings.dailyRefreshHint", {
                      time: credits?.refreshTime,
                      max: credits?.dailyRefreshMax,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">
              {t("settings.generalSettings")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Moon className="size-4 text-muted-foreground" />
                  <span className="text-sm">{t("settings.darkMode")}</span>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                  disabled={!mounted}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-sm">{t("settings.language")}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("settings.simplifiedChinese")}
                </span>
              </div>
            </div>
          </div>
        );
      case "usage":
        return (
          <div className="p-6">
            <div className="text-center text-muted-foreground py-10">
              {t("settings.noUsageData")}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[1000px] w-[90vw] p-0 gap-0 overflow-hidden !h-[75vh] min-h-[500px] max-h-[800px] bg-background text-foreground flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t("settings.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar */}
          <div className="w-64 bg-muted/30 border-r border-border flex flex-col shrink-0">
            <div className="p-4 flex items-center gap-2 font-semibold text-lg">
              <Sparkles className="size-5 text-foreground" />
              <span>Poco</span>
            </div>
            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 min-h-0">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    activeTab === item.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-border shrink-0">
              <button
                onClick={() => window.open("https://open-cowork.com", "_blank")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                <HelpCircle className="size-4" />
                <span>{t("settings.getHelp")}</span>
                <ExternalLink className="size-3 ml-auto" />
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 bg-background flex flex-col min-w-0 min-h-0">
            <div className="flex items-center justify-between p-5 pb-2 shrink-0">
              <h2 className="text-xl font-semibold">
                {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label}
              </h2>
            </div>
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
