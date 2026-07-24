import type { Translations, LanguageCode } from "./types";
import { SUPPORTED_LANGUAGES } from "./types";
import { APP_CONFIG } from "../config";

import en from "./languages/en";
import ptBR from "./languages/pt-BR";
import ptPT from "./languages/pt-PT";
import es from "./languages/es";
import esMX from "./languages/es-MX";
import fr from "./languages/fr";
import de from "./languages/de";
import it from "./languages/it";
import ja from "./languages/ja";
import ko from "./languages/ko";
import zhCN from "./languages/zh-CN";
import zhTW from "./languages/zh-TW";
import ru from "./languages/ru";
import ar from "./languages/ar";
import hi from "./languages/hi";
import th from "./languages/th";
import vi from "./languages/vi";
import pl from "./languages/pl";
import tr from "./languages/tr";
import nl from "./languages/nl";
import sv from "./languages/sv";
import da from "./languages/da";
import fi from "./languages/fi";
import no from "./languages/no";
import cs from "./languages/cs";
import sk from "./languages/sk";
import hu from "./languages/hu";
import ro from "./languages/ro";
import bg from "./languages/bg";
import hr from "./languages/hr";
import sl from "./languages/sl";
import uk from "./languages/uk";
import id from "./languages/id";
import ms from "./languages/ms";
import tl from "./languages/tl";

export const translations: Record<LanguageCode, Translations> = {
  en,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  es,
  "es-MX": esMX,
  fr,
  de,
  it,
  ja,
  ko,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  ru,
  ar,
  hi,
  th,
  vi,
  pl,
  tr,
  nl,
  sv,
  da,
  fi,
  no,
  cs,
  sk,
  hu,
  ro,
  bg,
  hr,
  sl,
  uk,
  id,
  ms,
  tl,
};

export function getSavedLanguage(): LanguageCode | null {
  try {
    const saved = localStorage.getItem(APP_CONFIG.language.storageKey);
    if (saved && saved in translations) {
      return saved as LanguageCode;
    }
  } catch {}
  return null;
}

export function saveLanguage(lang: LanguageCode): void {
  try {
    localStorage.setItem(APP_CONFIG.language.storageKey, lang);
  } catch {}
}

function normalizeLocale(locale: string): LanguageCode {
  const lower = locale.toLowerCase().trim();

  if (lower.startsWith("pt")) {
    if (lower.includes("pt") && (lower.includes("br") || lower.includes("latin"))) {
      return "pt-BR";
    }
    return "pt-PT";
  }
  if (lower.startsWith("es")) {
    if (lower.includes("mx") || lower.includes("419")) {
      return "es-MX";
    }
    return "es";
  }
  if (lower.startsWith("zh")) {
    if (lower.includes("tw") || lower.includes("hant")) {
      return "zh-TW";
    }
    return "zh-CN";
  }

  const simpleMap: Record<string, LanguageCode> = {
    en: "en",
    fr: "fr",
    de: "de",
    it: "it",
    ja: "ja",
    ko: "ko",
    ru: "ru",
    ar: "ar",
    hi: "hi",
    th: "th",
    vi: "vi",
    pl: "pl",
    tr: "tr",
    nl: "nl",
    sv: "sv",
    da: "da",
    fi: "fi",
    no: "no",
    nb: "no",
    nn: "no",
    cs: "cs",
    sk: "sk",
    hu: "hu",
    ro: "ro",
    bg: "bg",
    hr: "hr",
    sl: "sl",
    uk: "uk",
    id: "id",
    ms: "ms",
    tl: "tl",
    fil: "tl",
  };

  const base = lower.split("-")[0].split("_")[0];
  if (simpleMap[base]) {
    return simpleMap[base];
  }

  return "en";
}

export function detectOSLanguage(osLocale?: string): LanguageCode {
  if (osLocale) {
    return normalizeLocale(osLocale);
  }

  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language || (navigator as unknown as { languages?: string[] }).languages?.[0];
    if (browserLang) {
      return normalizeLocale(browserLang);
    }
  }

  return "en";
}

export function getTranslation(lang: LanguageCode): Translations {
  return translations[lang] || translations.en;
}

export function getLanguageName(code: LanguageCode): string {
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return meta?.name || code;
}

export function getLanguageNativeName(code: LanguageCode): string {
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return meta?.nativeName || code;
}

export type { Translations, LanguageCode };
