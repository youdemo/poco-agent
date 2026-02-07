"use client";

import * as React from "react";

import { useT } from "@/lib/i18n/client";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useCustomInstructionsStore } from "@/features/personalization/hooks/use-custom-instructions-store";
import { PersonalizationHeader } from "@/features/personalization/components/personalization-header";
import { CapabilityContentShell } from "@/features/capabilities/components/capability-content-shell";

export function PersonalizationPageClient() {
  const { t } = useT("translation");
  const store = useCustomInstructionsStore();

  const [enabled, setEnabled] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (initialized) return;
    if (!store.settings) return;
    setEnabled(Boolean(store.settings.enabled));
    setContent(store.settings.content || "");
    setInitialized(true);
  }, [initialized, store.settings]);

  const isEffectiveEnabled = React.useMemo(() => {
    return enabled && content.trim().length > 0;
  }, [enabled, content]);

  const emptyPlaceholder = React.useMemo(() => {
    return [
      t("library.personalization.customInstructions.description"),
      t("library.personalization.customInstructions.hintScope"),
    ].join("\n\n");
  }, [t]);

  const handleSave = React.useCallback(async () => {
    await store.save({ enabled, content });
    setInitialized(false);
  }, [content, enabled, store]);

  const handleClear = React.useCallback(async () => {
    await store.clear();
    setInitialized(false);
  }, [store]);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <PersonalizationHeader
        onSave={handleSave}
        onClear={handleClear}
        isSaving={store.isSaving}
        isLoading={store.isLoading}
      />

      <CapabilityContentShell className="overflow-auto">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="text-base font-medium">
              {t("library.personalization.customInstructions.title")}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (content.trim().length > 0) return;
                  setContent(
                    t(
                      "library.personalization.customInstructions.editor.template",
                    ),
                  );
                }}
                disabled={store.isLoading || store.isSaving}
              >
                {t(
                  "library.personalization.customInstructions.editor.insertTemplate",
                )}
              </Button>

              <Label className="text-sm text-muted-foreground">
                {isEffectiveEnabled
                  ? t(
                      "library.personalization.customInstructions.status.enabled",
                    )
                  : t(
                      "library.personalization.customInstructions.status.disabled",
                    )}
              </Label>
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
                disabled={store.isLoading || store.isSaving}
              />
            </div>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={emptyPlaceholder}
            className="mt-4 min-h-[360px] font-mono text-sm"
            disabled={store.isLoading || store.isSaving}
          />

          <div className="mt-2 text-xs text-muted-foreground">
            {t("library.personalization.customInstructions.hintSecrets")}
          </div>
        </div>
      </CapabilityContentShell>
    </div>
  );
}
