import type { SourceInfo } from "@/features/capabilities/types/source";

type TFunc = (key: string, options?: Record<string, unknown>) => string;

export function formatSourceLabel(
  source: SourceInfo | null | undefined,
  t: TFunc,
): string {
  const kind = source?.kind;

  if (kind === "github") {
    const base = t("library.sources.github");
    const repo = source?.repo?.trim();
    const ref = source?.ref?.trim();
    if (repo && ref) return `${base} - ${repo}@${ref}`;
    if (repo) return `${base} - ${repo}`;
    return base;
  }

  if (kind === "zip") {
    const base = t("library.sources.zip");
    const filename = source?.filename?.trim();
    if (filename) return `${base} - ${filename}`;
    return base;
  }

  if (kind === "system") return t("library.sources.system");
  if (kind === "manual") return t("library.sources.manual");
  return t("library.sources.unknown");
}
