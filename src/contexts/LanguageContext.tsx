import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  type LanguageCode,
  type Translations,
  detectOSLanguage,
  getSavedLanguage,
  saveLanguage,
  getTranslation,
} from "../i18n";

interface LanguageContextValue {
  language: LanguageCode;
  t: Translations;
  setLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return getSavedLanguage() || "en";
  });
  const [t, setT] = useState<Translations>(() => getTranslation(language));

  useEffect(() => {
    setT(getTranslation(language));
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (getSavedLanguage()) return;

    const detectLanguage = async () => {
      try {
        const osLocale = await invoke<string>("get_os_locale");
        const detected = detectOSLanguage(osLocale);
        setLanguageState(detected);
        saveLanguage(detected);
      } catch {
        const detected = detectOSLanguage();
        setLanguageState(detected);
        saveLanguage(detected);
      }
    };

    detectLanguage();
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    saveLanguage(lang);
    invoke("set_webview_language", { language: lang }).catch(() => {});
  }, []);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
