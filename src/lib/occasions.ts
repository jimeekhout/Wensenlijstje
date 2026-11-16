export const OCCASION_PRESETS = [
  "Verjaardag",
  "Sinterklaas",
  "Kerst",
  "Bruiloft",
  "Baby",
] as const;

export function splitOccasion(stored: string | null): { preset: string; custom: string } {
  if (!stored) return { preset: "", custom: "" };
  if ((OCCASION_PRESETS as readonly string[]).includes(stored)) {
    return { preset: stored, custom: "" };
  }
  return { preset: "Anders", custom: stored };
}

export function resolveOccasion(preset: string, custom: string): string {
  if (preset === "Anders") return custom.trim();
  if (preset === "") return "";
  return preset.trim();
}
