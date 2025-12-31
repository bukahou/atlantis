export type Theme = "light" | "dark" | "system";

export const defaultTheme: Theme = "system";

// Theme names for both locales
export const themeNames: Record<Theme, { zh: string; ja: string }> = {
  light: {
    zh: "浅色",
    ja: "ライト",
  },
  dark: {
    zh: "深色",
    ja: "ダーク",
  },
  system: {
    zh: "跟随系统",
    ja: "システム",
  },
};

export const themes: Theme[] = ["light", "dark", "system"];
