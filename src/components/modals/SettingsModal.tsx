import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLanguage } from "../../contexts/LanguageContext";
import { APP_CONFIG, DEFAULT_SETTINGS, type AppSettings } from "../../config";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "../../i18n/types";
import { getLanguageNativeName } from "../../i18n";
import { playClose, playNavigate, playToggle, playHover } from "../../utils/sounds";
import xboxLogo from "../../assets/images/xbox-logo.png";
import "../../styles/modals.css";

interface SettingsModalProps {
  onClose: () => void;
}

type Tab = "general" | "streaming" | "appearance" | "about";

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    invoke<AppSettings>("get_settings")
      .then((s) => {
        setSettings(s);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      try {
        await invoke("save_settings", { newSettings: next });
      } catch (e) {
        console.error("Failed to save settings:", e);
      }
    },
    [settings]
  );

  const handleLanguageChange = useCallback(
    async (lang: LanguageCode) => {
      playToggle();
      setLanguage(lang);
      await updateSettings({ language: lang });
    },
    [setLanguage, updateSettings]
  );

  const handleDiscordToggle = useCallback(
    async (enabled: boolean) => {
      playToggle();
      await updateSettings({ discord_rpc: enabled });
      try {
        await invoke("discord_set_enabled", { enabled });
      } catch (e) {
        console.error("Failed to toggle Discord RPC:", e);
      }
    },
    [updateSettings]
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "general", label: t.settings.general },
    { id: "streaming", label: t.settings.streaming },
    { id: "appearance", label: t.settings.appearance },
    { id: "about", label: t.settings.about },
  ];

  if (!loaded) return null;

  return (
    <div className="xbox-overlay" onClick={() => { playClose(); onClose(); }}>
      <div className="xbox-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="xbox-close" onClick={() => { playClose(); onClose(); }} onMouseEnter={playHover}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="xbox-sidebar glass-sidebar">
          <div className="xbox-sidebar-header">
            <h2>{t.settings.title}</h2>
          </div>

          <nav className="xbox-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`xbox-nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => { playNavigate(); setActiveTab(tab.id); }}
                onMouseEnter={playHover}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="xbox-content">
          {activeTab === "general" && (
            <div className="xbox-section">
              <h3 className="xbox-section-title">{t.settings.general}</h3>

              <div className="xbox-setting-row">
                <div className="xbox-setting-info">
                  <span className="xbox-setting-label">{t.settings.language}</span>
                  <span className="xbox-setting-desc">{t.settings.languageDesc}</span>
                </div>
                <select
                  className="xbox-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {getLanguageNativeName(lang.code)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="xbox-setting-row">
                <div className="xbox-setting-info">
                  <span className="xbox-setting-label">{t.settings.autoSaveSession}</span>
                  <span className="xbox-setting-desc">{t.settings.autoSaveSessionDesc}</span>
                </div>
                <label className="xbox-toggle">
                  <input
                    type="checkbox"
                    checked={settings.auto_save_session}
                    onChange={(e) => updateSettings({ auto_save_session: e.target.checked })}
                  />
                  <span className="xbox-toggle-slider" />
                </label>
              </div>

              <div className="xbox-setting-row">
                <div className="xbox-setting-info">
                  <span className="xbox-setting-label">{t.settings.autoLogout}</span>
                  <span className="xbox-setting-desc">{t.settings.autoLogoutDesc}</span>
                </div>
                <label className="xbox-toggle">
                  <input
                    type="checkbox"
                    checked={settings.auto_logout}
                    onChange={(e) => updateSettings({ auto_logout: e.target.checked })}
                  />
                  <span className="xbox-toggle-slider" />
                </label>
              </div>

              <div className="xbox-setting-row">
                <div className="xbox-setting-info">
                  <span className="xbox-setting-label">{t.settings.discordRpc}</span>
                  <span className="xbox-setting-desc">{t.settings.discordRpcDesc}</span>
                </div>
                <label className="xbox-toggle">
                  <input
                    type="checkbox"
                    checked={settings.discord_rpc}
                    onChange={(e) => handleDiscordToggle(e.target.checked)}
                  />
                  <span className="xbox-toggle-slider" />
                </label>
              </div>
            </div>
          )}

          {activeTab === "streaming" && (
            <div className="xbox-section">
              <h3 className="xbox-section-title">{t.settings.streaming}</h3>

              <div className="xbox-setting-row">
                <div className="xbox-setting-info">
                  <span className="xbox-setting-label">{t.settings.bandwidthAdjust}</span>
                  <span className="xbox-setting-desc">{t.settings.bandwidthAdjustDesc}</span>
                </div>
                <label className="xbox-toggle">
                  <input
                    type="checkbox"
                    checked={settings.bandwidth_adjust}
                    onChange={(e) => updateSettings({ bandwidth_adjust: e.target.checked })}
                  />
                  <span className="xbox-toggle-slider" />
                </label>
              </div>

              <div className="xbox-setting-row">
                <div className="xbox-setting-info">
                  <span className="xbox-setting-label">{t.settings.latencyMode}</span>
                  <span className="xbox-setting-desc">{t.settings.latencyModeDesc}</span>
                </div>
                <label className="xbox-toggle">
                  <input
                    type="checkbox"
                    checked={settings.latency_mode}
                    onChange={(e) => updateSettings({ latency_mode: e.target.checked })}
                  />
                  <span className="xbox-toggle-slider" />
                </label>
              </div>

              <h4 className="xbox-subsection-title">{t.settings.streamQuality}</h4>
              <p className="xbox-subsection-desc">{t.settings.streamQualityDesc}</p>

              <div className="xbox-radio-group">
                {(["auto", "1080p", "720p", "480p"] as const).map((quality) => {
                  const labels: Record<string, string> = {
                    auto: `${t.settings.autoQuality} (1080p)`,
                    "1080p": "1080p",
                    "720p": "720p",
                    "480p": "480p",
                  };
                  const descs: Record<string, string> = {
                    auto: "7 GB/hora",
                    "1080p": "7 GB/hora",
                    "720p": "3 GB/hora",
                    "480p": "1.5 GB/hora",
                  };
                  return (
                    <label key={quality} className="xbox-radio-card">
                      <input
                        type="radio"
                        name="quality"
                        value={quality}
                        checked={settings.stream_quality === quality}
                        onChange={() => updateSettings({ stream_quality: quality })}
                      />
                      <div className="xbox-radio-content">
                        <span className="xbox-radio-title">{labels[quality]}</span>
                        <span className="xbox-radio-desc">{descs[quality]}</span>
                      </div>
                      <div className="xbox-radio-circle" />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="xbox-section">
              <h3 className="xbox-section-title">{t.settings.appearance}</h3>

              <h4 className="xbox-subsection-title">{t.settings.theme}</h4>
              <p className="xbox-subsection-desc">{t.settings.themeDesc}</p>

              <div className="xbox-radio-group">
                <label className="xbox-radio-card">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={settings.theme === "dark"}
                    onChange={() => updateSettings({ theme: "dark" })}
                  />
                  <div className="xbox-radio-content">
                    <span className="xbox-radio-title">{t.settings.darkTheme}</span>
                  </div>
                  <div className="xbox-radio-circle" />
                </label>
                <label className="xbox-radio-card">
                  <input
                    type="radio"
                    name="theme"
                    value="darker"
                    checked={settings.theme === "darker"}
                    onChange={() => updateSettings({ theme: "darker" })}
                  />
                  <div className="xbox-radio-content">
                    <span className="xbox-radio-title">{t.settings.darkerTheme}</span>
                  </div>
                  <div className="xbox-radio-circle" />
                </label>
              </div>

              <div className="xbox-setting-row">
                <div className="xbox-setting-info">
                  <span className="xbox-setting-label">{t.settings.animations}</span>
                  <span className="xbox-setting-desc">{t.settings.animationsDesc}</span>
                </div>
                <label className="xbox-toggle">
                  <input
                    type="checkbox"
                    checked={settings.animations}
                    onChange={(e) => updateSettings({ animations: e.target.checked })}
                  />
                  <span className="xbox-toggle-slider" />
                </label>
              </div>

              <div className="xbox-setting-row">
                <div className="xbox-setting-info">
                  <span className="xbox-setting-label">{t.settings.vibrancy}</span>
                  <span className="xbox-setting-desc">{t.settings.vibrancyDesc}</span>
                </div>
                <label className="xbox-toggle">
                  <input
                    type="checkbox"
                    checked={settings.vibrancy}
                    onChange={(e) => updateSettings({ vibrancy: e.target.checked })}
                  />
                  <span className="xbox-toggle-slider" />
                </label>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="xbox-section">
              <h3 className="xbox-section-title">{t.settings.about}</h3>

              <div className="xbox-about-card">
                <div className="xbox-about-logo">
                  <img src={xboxLogo} alt="Xbox" width="40" height="40" />
                </div>
                <div className="xbox-about-info">
                  <h4>{APP_CONFIG.appName}</h4>
                  <p className="xbox-about-version">{t.settings.version} {APP_CONFIG.version}</p>
                  <p className="xbox-about-desc">{t.settings.launcherDescription}</p>
                </div>
              </div>

              <a
                href={APP_CONFIG.github.releasesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="xbox-link-btn"
                onMouseEnter={playHover}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                {t.settings.githubProject}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
