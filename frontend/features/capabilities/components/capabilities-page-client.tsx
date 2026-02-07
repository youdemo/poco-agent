"use client";

import * as React from "react";
import { Suspense } from "react";

import { CapabilitiesSidebar } from "@/features/capabilities/components/capabilities-sidebar";
import { useCapabilityViews } from "@/features/capabilities/hooks/use-capability-views";

export function CapabilitiesPageClient() {
  const views = useCapabilityViews();
  const [activeViewId, setActiveViewId] = React.useState<string>(
    views[0]?.id ?? "skills",
  );

  React.useEffect(() => {
    if (!views.length) return;
    if (views.some((view) => view.id === activeViewId)) return;
    setActiveViewId(views[0]?.id ?? "skills");
  }, [views, activeViewId]);

  const activeView = React.useMemo(() => {
    return views.find((view) => view.id === activeViewId) ?? views[0];
  }, [views, activeViewId]);

  const ActiveComponent = activeView?.component;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_minmax(0,1fr)]">
        <CapabilitiesSidebar
          views={views}
          activeViewId={activeView?.id}
          onSelect={setActiveViewId}
        />

        <main className="min-h-0 overflow-hidden">
          {ActiveComponent ? (
            <Suspense fallback={<div className="h-full w-full" />}>
              <div className="flex h-full min-h-0 flex-col">
                <ActiveComponent key={activeView?.id} />
              </div>
            </Suspense>
          ) : null}
        </main>
      </div>
    </div>
  );
}
