import type * as React from "react";

import { cn } from "@/lib/utils";

interface CapabilityPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function CapabilityPageHeader({
  title,
  actions,
  className,
}: CapabilityPageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm sm:px-6",
        className,
      )}
    >
      <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
      {actions ? (
        <div className="flex min-w-0 items-center justify-end gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
