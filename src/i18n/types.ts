export interface Translations {
  common: {
    appName: string;
    version: string;
    loading: string;
    cancel: string;
    close: string;
    save: string;
    back: string;
    next: string;
    checkingInstallation: string;
    installing: string;
    installingApp: string;
    creatingShortcut: string;
    installationComplete: string;
    installSuccess: string;
  };
  update: {
    title: string;
    newVersionAvailable: string;
    currentVersion: string;
    latestVersion: string;
    updateNotes: string;
    download: string;
    later: string;
    dismiss: string;
    checking: string;
    upToDate: string;
    error: string;
  };
  titlebar: {
    minimize: string;
    maximize: string;
    restore: string;
    close: string;
  };
  launcher: {
    checkingSession: string;
    loginXbox: string;
    loggingIn: string;
    play: string;
    playing: string;
    stopGame: string;
    xboxCloudGaming: string;
    github: string;
    settings: string;
    info: string;
    fullscreenHint: string;
  };
  settings: {
    title: string;
    general: string;
    streaming: string;
    appearance: string;
    about: string;
    version: string;
    autoSaveSession: string;
    autoSaveSessionDesc: string;
    autoLogout: string;
    autoLogoutDesc: string;
    streamQuality: string;
    streamQualityDesc: string;
    autoQuality: string;
    resolution1080p: string;
    resolution720p: string;
    resolution480p: string;
    bandwidthAdjust: string;
    bandwidthAdjustDesc: string;
    latencyMode: string;
    latencyModeDesc: string;
    theme: string;
    themeDesc: string;
    darkTheme: string;
    darkerTheme: string;
    animations: string;
    animationsDesc: string;
    vibrancy: string;
    vibrancyDesc: string;
    language: string;
    languageDesc: string;
    launcherDescription: string;
    githubProject: string;
    discordRpc: string;
    discordRpcDesc: string;
  };
  info: {
    title: string;
    version: string;
    aboutProject: string;
    aboutProjectDesc: string;
    features: string;
    featureLogin: string;
    featureSession: string;
    featureInterface: string;
    featureGameWindow: string;
    featureDetection: string;
    featureTimer: string;
    technologies: string;
    links: string;
    github: string;
    madeBy: string;
  };
}

export type LanguageCode =
  | "en"
  | "pt-BR"
  | "pt-PT"
  | "es"
  | "es-MX"
  | "fr"
  | "de"
  | "it"
  | "ja"
  | "ko"
  | "zh-CN"
  | "zh-TW"
  | "ru"
  | "ar"
  | "hi"
  | "th"
  | "vi"
  | "pl"
  | "tr"
  | "nl"
  | "sv"
  | "da"
  | "fi"
  | "no"
  | "cs"
  | "sk"
  | "hu"
  | "ro"
  | "bg"
  | "hr"
  | "sl"
  | "uk"
  | "id"
  | "ms"
  | "tl";

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Português (Brasil)" },
  { code: "pt-PT", name: "Portuguese (Portugal)", nativeName: "Português (Portugal)" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "es-MX", name: "Spanish (Mexico)", nativeName: "Español (México)" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "tl", name: "Filipino", nativeName: "Filipino" },
];
