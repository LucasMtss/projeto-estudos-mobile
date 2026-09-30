import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { create } from "zustand";
import { deDE } from "@/i18n/locales/de-DE";
import { enUS } from "@/i18n/locales/en-US";
import { esES } from "@/i18n/locales/es-ES";
import { frFR } from "@/i18n/locales/fr-FR";
import { ptBR } from "@/i18n/locales/pt-BR";
import type { MessagePath, Messages } from "@/i18n/types";

const STORAGE_KEY = "logic-jigsaw-locale-v1";

// Para adicionar um idioma: crie o arquivo em locales/, inclua a entrada
// aqui e registre o dicionário em dictionaries. O tipo Messages exige as mesmas chaves.
export const LOCALES = [
  { id: "pt-BR", flag: "br", nativeName: "Português" },
  { id: "en-US", flag: "us", nativeName: "English" },
  { id: "es-ES", flag: "es", nativeName: "Español" },
  { id: "fr-FR", flag: "fr", nativeName: "Français" },
  { id: "de-DE", flag: "de", nativeName: "Deutsch" },
] as const;

export type AppLocale = (typeof LOCALES)[number]["id"];
export type FlagCode = (typeof LOCALES)[number]["flag"];

const dictionaries: Record<AppLocale, Messages> = {
  "pt-BR": ptBR,
  "en-US": enUS,
  "es-ES": esES,
  "fr-FR": frFR,
  "de-DE": deDE,
};

const LEVEL_PATHS = ["level.beginner", "level.easy", "level.medium", "level.hard", "level.expert"] as const;

function isLocale(value: string | null): value is AppLocale {
  return LOCALES.some((item) => item.id === value);
}

export function deviceLocale(): AppLocale {
  try {
    const locale = getLocales()[0];
    const tag = locale?.languageTag ?? "";
    const exact = LOCALES.find((item) => item.id.toLowerCase() === tag.toLowerCase());
    if (exact) return exact.id;
    const language = (locale?.languageCode ?? "").toLowerCase();
    const byLanguage = LOCALES.find((item) => item.id.toLowerCase().startsWith(`${language}-`));
    if (byLanguage) return byLanguage.id;
  } catch {
    return "pt-BR";
  }
  return "pt-BR";
}

function lookup(messages: Messages, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in node) return (node as Record<string, unknown>)[key];
    return undefined;
  }, messages);
  return typeof value === "string" ? value : undefined;
}

export function translate(locale: AppLocale, path: MessagePath, vars?: Record<string, string | number>): string {
  const template = lookup(dictionaries[locale], path) ?? lookup(dictionaries["pt-BR"], path) ?? path;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

type I18nState = {
  locale: AppLocale;
  ready: boolean;
  hydrate: () => Promise<void>;
  setLocale: (locale: AppLocale) => Promise<void>;
};

export const useI18n = create<I18nState>((set) => ({
  locale: "pt-BR",
  ready: false,
  async hydrate() {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    set({ locale: isLocale(saved) ? saved : deviceLocale(), ready: true });
  },
  async setLocale(locale) {
    set({ locale });
    await AsyncStorage.setItem(STORAGE_KEY, locale);
  },
}));

export function t(path: MessagePath, vars?: Record<string, string | number>): string {
  return translate(useI18n.getState().locale, path, vars);
}

export function useT() {
  const locale = useI18n((state) => state.locale);
  return (path: MessagePath, vars?: Record<string, string | number>) => translate(locale, path, vars);
}

export function levelName(stars: number, translatePath: typeof t = t): string {
  const path = LEVEL_PATHS[stars - 1] ?? LEVEL_PATHS[0];
  return translatePath(path);
}
