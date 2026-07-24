export interface AppSettings {
  language: string;
  auto_save_session: boolean;
  auto_logout: boolean;
  stream_quality: string;
  bandwidth_adjust: boolean;
  latency_mode: boolean;
  theme: string;
  animations: boolean;
  vibrancy: boolean;
  discord_rpc: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  auto_save_session: true,
  auto_logout: false,
  stream_quality: "auto",
  bandwidth_adjust: true,
  latency_mode: true,
  theme: "dark",
  animations: true,
  vibrancy: false,
  discord_rpc: true,
};
