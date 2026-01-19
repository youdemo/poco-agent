"use client";

import * as React from "react";
import { Loader2, Plus, Save } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EnvVarUpsertInput } from "@/features/env-vars/hooks/use-env-vars-store";

export type EnvVarDialogMode = "create" | "edit" | "override";

interface EnvVarUpsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: EnvVarUpsertInput) => Promise<void> | void;
  isSaving?: boolean;
  mode?: EnvVarDialogMode;
  initialKey?: string;
  initialDescription?: string | null;
  keyReadOnly?: boolean;
}

export function AddEnvVarDialog({
  open,
  onOpenChange,
  onSave,
  isSaving = false,
  mode = "create",
  initialKey,
  initialDescription,
  keyReadOnly,
}: EnvVarUpsertDialogProps) {
  const { t } = useT("translation");
  const [key, setKey] = React.useState(initialKey || "");
  const [value, setValue] = React.useState("");
  const [description, setDescription] = React.useState(
    initialDescription || "",
  );

  const isKeyReadOnly = Boolean(keyReadOnly ?? mode !== "create");
  const requiresValue = mode !== "edit";

  // Reset form when dialog opens / mode changes
  React.useEffect(() => {
    if (!open) return;
    setKey(initialKey || "");
    setValue("");
    setDescription(initialDescription || "");
  }, [open, initialDescription, initialKey]);

  const title =
    mode === "create"
      ? t("library.envVars.addTitle", "新增环境变量")
      : mode === "override"
        ? t("library.envVars.overrideTitle", "覆盖系统变量")
        : t("library.envVars.editTitle", "更新环境变量");

  const valueHint =
    mode === "edit"
      ? t(
          "library.envVars.valueUpdateHint",
          "不会显示旧值；留空表示不修改当前值",
        )
      : t(
          "library.envVars.valueCreateHint",
          "不会显示旧值；请输入要设置的新值",
        );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedKey = key.trim();
    const trimmedValue = value.trim();

    if (!trimmedKey) return;
    if (requiresValue && !trimmedValue) return;

    await onSave({
      key: trimmedKey,
      value: trimmedValue ? trimmedValue : undefined,
      description: description.trim() || undefined,
    });

    onOpenChange(false);
  };

  const isValid =
    Boolean(key.trim()) && (requiresValue ? Boolean(value.trim()) : true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Key */}
            <div className="space-y-2">
              <Label htmlFor="env-key">{t("library.envVars.keyLabel")}</Label>
              <Input
                id="env-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="OPENAI_API_KEY"
                autoCapitalize="characters"
                disabled={isSaving || isKeyReadOnly}
                className="font-mono"
              />
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label htmlFor="env-value">
                {t("library.envVars.valueLabel")}
              </Label>
              <Input
                id="env-value"
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t("library.envVars.valuePlaceholder")}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">{valueHint}</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="env-description">
                {t("library.envVars.descriptionLabel")}
              </Label>
              <Input
                id="env-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("library.envVars.descriptionPlaceholder")}
                disabled={isSaving}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {t(
                "library.envVars.secretHelp",
                "环境变量不会在前端展示明文，只能重新设置",
              )}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!isValid || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("library.envVars.saving")}
                </>
              ) : (
                <>
                  {mode === "create" ? (
                    <Plus className="mr-2 size-4" />
                  ) : (
                    <Save className="mr-2 size-4" />
                  )}
                  {mode === "create"
                    ? t("library.envVars.addButton")
                    : t("library.envVars.save", "保存")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
