import { useLanguage } from "../../contexts/LanguageContext";
import { APP_CONFIG } from "../../config";
import { useSessionStore, useGameStore, useUIStore } from "../../stores";
import { useAuth, useGameWindow } from "../../hooks";
import { playClick, playHover, playOpen } from "../../utils/sounds";
import TitleBar from "../layout/TitleBar";
import SettingsModal from "../modals/SettingsModal";
import InfoModal from "../modals/InfoModal";
import fortniteIcon from "../../assets/images/fortnite-icon.png";
import fortniteBanner from "../../assets/images/fortnite-banner.png";
import xboxLogo from "../../assets/images/xbox-logo.png";
import { open } from "@tauri-apps/plugin-shell";
import "../../styles/launcher.css";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}m${String(s).padStart(2, "0")}s`;
}

interface LauncherProps {
  onLoginSuccess: () => void;
}

export default function Launcher({ onLoginSuccess }: LauncherProps) {
  const { t } = useLanguage();
  const session = useSessionStore((s) => s.session);
  const { isLoggingIn, gameRunning, gameTime } = useGameStore();
  const { showSettings, showInfo, setShowSettings, setShowInfo } = useUIStore();
  const { handleLogin } = useAuth({ onLoginSuccess });
  const { handlePlay, handleStopGame } = useGameWindow();

  return (
    <div className="launcher">
      <TitleBar />

      <div className="launcher-header">
        <div className="launcher-brand">
          <div className="fortnite-icon">
            <img src={fortniteIcon} alt="Fortnite" width="48" height="48" />
          </div>
          <div className="brand-divider" />
          <h1 className="launcher-title">FORTNITE</h1>
        </div>

        <div className="launcher-actions">
          <button
            className="action-icon glass-surface"
            title={t.launcher.github}
            onClick={() => { playClick(); open(APP_CONFIG.github.releasesUrl); }}
            onMouseEnter={playHover}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </button>
          <button
            className="action-icon glass-surface"
            title={t.launcher.settings}
            onClick={() => { playOpen(); setShowSettings(true); }}
            onMouseEnter={playHover}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>
          <button
            className="action-icon glass-surface"
            title={t.launcher.info}
            onClick={() => { playOpen(); setShowInfo(true); }}
            onMouseEnter={playHover}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="launcher-background">
        <img
          src={fortniteBanner}
          alt=""
          className="bg-image"
          draggable="false"
        />
        <div className="bg-overlay" />
      </div>

      <div className="launcher-footer">
        <div className="footer-left">
          <div className="xbox-logo">
            <img src={xboxLogo} alt="Xbox" width="40" height="40" />
          </div>
          <div className="footer-text">
            <span className="xbox-label">
              {t.launcher.xboxCloudGaming} (<span className="xbox-highlight">XCloud</span>)
            </span>
          </div>
        </div>

        <div className="footer-center">
          {gameRunning ? (
            <>
              <div className="fullscreen-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{t.launcher.fullscreenHint}</span>
              </div>
              <button className="running-button glass-btn" onClick={handleStopGame} onMouseEnter={playHover}>
                <span className="running-dot" />
                <span>{t.launcher.playing} ({formatTime(gameTime)})</span>
              </button>
            </>
          ) : session.is_logged_in ? (
            <>
              <div className="fullscreen-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{t.launcher.fullscreenHint}</span>
              </div>
              <button className="play-button glass-btn" onClick={handlePlay} onMouseEnter={playHover}>
                <span>{t.launcher.play}</span>
              </button>
            </>
          ) : (
            <button
              className="login-button glass-btn"
              onClick={handleLogin}
              onMouseEnter={playHover}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <div className="spinner small" />
                  <span>{t.launcher.loggingIn}</span>
                </>
              ) : (
                <span>{t.launcher.loginXbox}</span>
              )}
            </button>
          )}
        </div>

        <div className="footer-right">
          <span className="version">{t.common.version}: {APP_CONFIG.version}</span>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
