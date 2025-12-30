import { Locale, Translations } from "@/types/i18n";
import { zh } from "./locales/zh";
import { ja } from "./locales/ja";

export const locales: Record<Locale, Translations> = {
  zh,
  ja,
};

export const localeNames: Record<Locale, string> = {
  zh: "中文",
  ja: "日本語",
};

export const defaultLocale: Locale = "zh";

export function getTranslations(locale: Locale): Translations {
  return locales[locale] || locales[defaultLocale];
}
