import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState, useCallback, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { playClick, playHover } from "../../utils/sounds";
import "../../styles/titlebar.css";

export default function TitleBar() {
  const { t } = useLanguage();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const window = getCurrentWindow();
    window.isMaximized().then(setIsMaximized);
    const unlisten = window.onResized(() => {
      window.isMaximized().then(setIsMaximized);
    });
    return () => {
      unlisten.then((fn: () => void) => fn());
    };
  }, []);

  const handleMinimize = useCallback(() => {
    playClick();
    getCurrentWindow().minimize();
  }, []);

  const handleMaximize = useCallback(() => {
    playClick();
    const window = getCurrentWindow();
    if (isMaximized) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }, [isMaximized]);

  const handleClose = useCallback(() => {
    playClick();
    getCurrentWindow().close();
  }, []);

  return (
    <div data-tauri-drag-region className="titlebar">
      <div className="titlebar-left" data-tauri-drag-region>
        <span className="titlebar-title">Fortnite XCloud Launcher</span>
      </div>
      <div className="titlebar-buttons">
        <button
          className="titlebar-btn"
          onClick={handleMinimize}
          onMouseEnter={playHover}
          aria-label={t.titlebar.minimize}
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" rx="0.5" />
          </svg>
        </button>
        <button
          className="titlebar-btn"
          onClick={handleMaximize}
          onMouseEnter={playHover}
          aria-label={isMaximized ? t.titlebar.restore : t.titlebar.maximize}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2.5" y="0.5" width="7" height="7" rx="1" />
              <rect x="0.5" y="2.5" width="7" height="7" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="1" y="1" width="8" height="8" rx="1.5" />
            </svg>
          )}
        </button>
        <button
          className="titlebar-btn close"
          onClick={handleClose}
          onMouseEnter={playHover}
          aria-label={t.titlebar.close}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M1 1l8 8M9 1l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
