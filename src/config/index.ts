import rawConfig from "@config";
import type { AppSettings } from "./settings";

export { type AppSettings } from "./settings";

const config = rawConfig as typeof rawConfig & {
  github: { apiUrl: string; releasesUrl: string; latestReleaseUrl: string };
};

export const APP_META = {
  name: config.app.name,
  version: config.app.version,
  author: config.app.author,
  identifier: config.app.identifier,
} as const;

export const OAUTH_CONFIG = {
  clientId: config.oauth.clientId,
  scope: config.oauth.scope,
  redirectUri: config.oauth.redirectUri,
  authEndpoint: config.oauth.authEndpoint,
} as const;

export const GITHUB_CONFIG = {
  owner: config.github.owner,
  repo: config.github.repo,
  get apiUrl() {
    return `https://api.github.com/repos/${this.owner}/${this.repo}`;
  },
  get releasesUrl() {
    return `https://github.com/${this.owner}/${this.repo}/releases`;
  },
  get latestReleaseUrl() {
    return `https://github.com/${this.owner}/${this.repo}/releases/latest`;
  },
};

export const GAME_CONFIG = {
  url: config.game.url,
  streamPath: config.game.streamPath,
};

export const WINDOW_CONFIG = {
  width: config.window.width,
  height: config.window.height,
  minWidth: config.window.minWidth,
  minHeight: config.window.minHeight,
  title: config.window.title,
  userAgent: config.window.userAgent,
};

export const UPDATE_CONFIG = {
  checkOnStartup: config.update.checkOnStartup,
  startupDelay: config.update.startupDelay,
  checkInterval: config.update.checkIntervalMs,
};

export const STORAGE_KEYS = {
  session: config.session.storageKey,
  language: config.language.storageKey,
} as const;

export const LANGUAGE_CONFIG = {
  storageKey: STORAGE_KEYS.language,
  fallback: config.language.fallback as "en",
};

export const DEFAULT_SETTINGS: AppSettings = {
  language: config.defaultSettings.language,
  auto_save_session: config.defaultSettings.auto_save_session,
  auto_logout: config.defaultSettings.auto_logout,
  stream_quality: config.defaultSettings.stream_quality,
  bandwidth_adjust: config.defaultSettings.bandwidth_adjust,
  latency_mode: config.defaultSettings.latency_mode,
  theme: config.defaultSettings.theme,
  animations: config.defaultSettings.animations,
  vibrancy: config.defaultSettings.vibrancy,
  discord_rpc: config.defaultSettings.discord_rpc,
};

export const APP_CONFIG = {
  appName: APP_META.name,
  version: APP_META.version,
  author: APP_META.author,
  identifier: APP_META.identifier,
  github: GITHUB_CONFIG,
  oauth: OAUTH_CONFIG,
  game: GAME_CONFIG,
  window: WINDOW_CONFIG,
  update: UPDATE_CONFIG,
  session: { storageKey: STORAGE_KEYS.session },
  language: LANGUAGE_CONFIG,
} as const;

export type AppConfig = typeof APP_CONFIG;
