import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "../i18n/types";
import { getLanguageNativeName } from "../i18n";
import { playClose, playNavigate, playToggle, playHover } from "../utils/sounds";
import "../styles/modals.css";

interface SettingsModalProps {
  onClose: () => void;
}

type Tab = "general" | "streaming" | "appearance" | "about";

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const tabs: { id: Tab; label: string }[] = [
    { id: "general", label: t.settings.general },
    { id: "streaming", label: t.settings.streaming },
    { id: "appearance", label: t.settings.appearance },
    { id: "about", label: t.settings.about },
  ];

  return (
    <div className="modal-overlay" onClick={() => { playClose(); onClose(); }}>
      <div className="modal-container settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-sidebar">
          <div className="modal-sidebar-header">
            <h2>{t.settings.title}</h2>
          </div>
          <nav className="modal-sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`sidebar-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => { playNavigate(); setActiveTab(tab.id); }}
                onMouseEnter={playHover}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="modal-sidebar-footer">
            <span className="modal-version">Fortnite XCloud Launcher v2.0</span>
          </div>
        </div>

        <div className="modal-content">
          <button className="modal-close" onClick={() => { playClose(); onClose(); }} onMouseEnter={playHover}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>

          {activeTab === "general" && (
            <div className="settings-section">
              <h3 className="section-title">{t.settings.general}</h3>
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">{t.settings.language}</span>
                    <span className="setting-desc">{t.settings.languageDesc}</span>
                  </div>
                  <select
                    className="setting-select"
                    value={language}
                    onChange={(e) => { playToggle(); setLanguage(e.target.value as LanguageCode); }}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {getLanguageNativeName(lang.code)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">{t.settings.autoSaveSession}</span>
                    <span className="setting-desc">{t.settings.autoSaveSessionDesc}</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked onChange={playToggle} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">{t.settings.autoLogout}</span>
                    <span className="setting-desc">{t.settings.autoLogoutDesc}</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" onChange={playToggle} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "streaming" && (
            <div className="settings-section">
              <h3 className="section-title">{t.settings.streaming}</h3>
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">{t.settings.streamQuality}</span>
                    <span className="setting-desc">{t.settings.streamQualityDesc}</span>
                  </div>
                  <select className="setting-select">
                    <option value="auto">{t.settings.autoQuality}</option>
                    <option value="1080p">{t.settings.resolution1080p}</option>
                    <option value="720p">{t.settings.resolution720p}</option>
                    <option value="480p">{t.settings.resolution480p}</option>
                  </select>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">{t.settings.bandwidthAdjust}</span>
                    <span className="setting-desc">{t.settings.bandwidthAdjustDesc}</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked onChange={playToggle} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">{t.settings.latencyMode}</span>
                    <span className="setting-desc">{t.settings.latencyModeDesc}</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked onChange={playToggle} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="settings-section">
              <h3 className="section-title">{t.settings.appearance}</h3>
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">{t.settings.theme}</span>
                    <span className="setting-desc">{t.settings.themeDesc}</span>
                  </div>
                  <select className="setting-select">
                    <option value="dark">{t.settings.darkTheme}</option>
                    <option value="darker">{t.settings.darkerTheme}</option>
                  </select>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">{t.settings.animations}</span>
                    <span className="setting-desc">{t.settings.animationsDesc}</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked onChange={playToggle} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">{t.settings.vibrancy}</span>
                    <span className="setting-desc">{t.settings.vibrancyDesc}</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" onChange={playToggle} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="settings-section">
              <h3 className="section-title">{t.settings.about}</h3>
              <div className="settings-group">
                <div className="about-card">
                  <div className="about-logo">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--accent-green)">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                    </svg>
                  </div>
                  <div className="about-info">
                    <h4>Fortnite XCloud Launcher</h4>
                    <p className="about-version">{t.settings.version} 2.0.0</p>
                    <p className="about-desc">
                      {t.settings.launcherDescription}
                    </p>
                    <div className="about-links">
                      <a
                        href="https://github.com/shindozk/Fortnite-XCloud-PC"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="about-link"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        {t.settings.githubProject}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
