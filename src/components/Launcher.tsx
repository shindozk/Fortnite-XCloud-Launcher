import { useState, useCallback, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-shell";
import { useLanguage } from "../contexts/LanguageContext";
import { playClick, playHover, playOpen, playClose, playStart, playStop, playSuccess } from "../utils/sounds";
import TitleBar from "./TitleBar";
import SettingsModal from "./SettingsModal";
import InfoModal from "./InfoModal";
import fortniteIcon from "../assets/images/fortnite-icon.png";
import fortniteBanner from "../assets/images/fortnite-banner.png";
import xboxLogo from "../assets/images/xbox-logo.png";
import "../styles/launcher.css";

interface SessionStatus {
  is_logged_in: boolean;
  username: string | null;
}

interface LauncherProps {
  session: SessionStatus;
  isLoading: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

const GAME_URL = "https://play.xbox.com/stream/BT5P2X999VH2/fortnite";
const APP_VERSION = "2.0";

function generateRandomUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateState(): string {
  const id = generateRandomUUID();
  const json = JSON.stringify({ id, meta: { interactionType: "redirect" } });
  const encoded = btoa(json);
  const suffix = generateRandomUUID();
  return `${encoded}|${suffix}`;
}

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

async function buildAuthUrl(): Promise<{ url: string; verifier: string }> {
  const verifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: "1f907974-e22b-4810-a9de-d9647380c97e",
    scope: "xboxlive.signin openid profile offline_access",
    redirect_uri: "https://play.xbox.com/auth/msa",
    response_type: "code",
    response_mode: "fragment",
    prompt: "select_account",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  params.set("state", generateState());
  params.set("nonce", generateRandomUUID());

  return {
    url: `https://login.live.com/oauth20_authorize.srf?${params.toString()}`,
    verifier,
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}m${String(s).padStart(2, "0")}s`;
}

export default function Launcher({
  session,
  isLoading,
  onLoginSuccess,
}: LauncherProps) {
  const { t, language } = useLanguage();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const gameWindowRef = useRef<WebviewWindow | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (gameRunning) {
      timerRef.current = setInterval(() => {
        setGameTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setGameTime(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameRunning]);

  const handleLogin = useCallback(async () => {
    playOpen();
    setIsLoggingIn(true);
    try {
      const { url: authUrl } = await buildAuthUrl();
      const parentWindow = getCurrentWindow();
      const parentSize = await parentWindow.innerSize();

      const authWindow = new WebviewWindow("auth-window", {
        url: authUrl,
        title: "Login Xbox",
        width: Math.min(800, parentSize.width),
        height: Math.min(650, parentSize.height - 50),
        center: true,
        resizable: true,
        decorations: true,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      });

      let checkInterval: ReturnType<typeof setInterval> | null = null;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const cleanup = async () => {
        if (checkInterval) clearInterval(checkInterval);
        if (timeoutId) clearTimeout(timeoutId);
        checkInterval = null;
        timeoutId = null;
        setIsLoggingIn(false);
      };

      const closeAuthWindow = async () => {
        try {
          await authWindow.close();
        } catch {
          // window might already be closed
        }
      };

      authWindow.once("tauri://error", (e) => {
        console.error("Auth window error:", e);
        cleanup();
      });

      authWindow.once("tauri://created", () => {
        let hasCompleted = false;

        const completeLogin = async () => {
          if (hasCompleted) return;
          hasCompleted = true;
          playSuccess();
          console.log("[Auth] Login complete, closing window");
          await cleanup();
          try {
            await invoke("mark_logged_in");
          } catch {
            // ignore
          }
          await closeAuthWindow();
          onLoginSuccess();
        };

        const cancelLogin = async () => {
          if (hasCompleted) return;
          hasCompleted = true;
          playClose();
          console.log("[Auth] Auth window closed by user");
          await cleanup();
        };

        authWindow.listen("tauri://destroyed", () => {
          cancelLogin();
        });

        checkInterval = setInterval(async () => {
          if (hasCompleted) return;
          try {
            const isOnXbox = await invoke<boolean>("check_auth_url");
            if (isOnXbox) {
              console.log("[Auth] Detected play.xbox.com URL");
              await completeLogin();
              return;
            }

            const status = await invoke<SessionStatus>("check_session");
            if (status.is_logged_in) {
              console.log("[Auth] Session detected via polling");
              await completeLogin();
            }
          } catch {
            await cancelLogin();
          }
        }, 2000);

        timeoutId = setTimeout(async () => {
          await cleanup();
        }, 600000);

        console.log("[Auth] Auth window opened, polling for session...");
      });
    } catch (err) {
      console.error("Failed to open auth window:", err);
      setIsLoggingIn(false);
    }
  }, [onLoginSuccess]);

  const handlePlay = useCallback(async () => {
    playStart();
    try {
      const parentWindow = getCurrentWindow();
      const parentSize = await parentWindow.innerSize();

      const gameWindow = new WebviewWindow("game-window", {
        url: GAME_URL,
        title: "Fortnite - XCloud",
        width: parentSize.width,
        height: parentSize.height,
        center: true,
        maximized: true,
        resizable: true,
        decorations: true,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      });

      gameWindowRef.current = gameWindow;
      setGameRunning(true);

      gameWindow.once("tauri://created", async () => {
        try {
          const langMap: Record<string, string> = {
            "en": "en-US",
            "pt-BR": "pt-BR",
            "pt-PT": "pt-PT",
            "es": "es-ES",
            "es-MX": "es-MX",
            "fr": "fr-FR",
            "de": "de-DE",
            "it": "it-IT",
            "ja": "ja-JP",
            "ko": "ko-KR",
            "zh-CN": "zh-CN",
            "zh-TW": "zh-TW",
            "ru": "ru-RU",
            "ar": "ar-SA",
            "hi": "hi-IN",
            "th": "th-TH",
            "vi": "vi-VN",
            "pl": "pl-PL",
            "tr": "tr-TR",
            "nl": "nl-NL",
            "sv": "sv-SE",
            "da": "da-DK",
            "fi": "fi-FI",
            "no": "nb-NO",
            "cs": "cs-CZ",
            "sk": "sk-SK",
            "hu": "hu-HU",
            "ro": "ro-RO",
            "bg": "bg-BG",
            "hr": "hr-HR",
            "sl": "sl-SI",
            "uk": "uk-UA",
            "id": "id-ID",
            "ms": "ms-MY",
            "tl": "fil-PH",
          };
          const webviewLang = langMap[language] || "en-US";
          (gameWindow as unknown as { eval: (js: string) => Promise<void> }).eval(
            `document.documentElement.lang = '${webviewLang}';`
          ).catch(() => {});
        } catch {}
      });

      gameWindow.listen("tauri://destroyed", () => {
        gameWindowRef.current = null;
        setGameRunning(false);
      });

      gameWindow.once("tauri://error", () => {
        gameWindowRef.current = null;
        setGameRunning(false);
      });
    } catch (err) {
      console.error("Failed to open game window:", err);
      setGameRunning(false);
    }
  }, []);

  const handleStopGame = useCallback(async () => {
    playStop();
    if (gameWindowRef.current) {
      try {
        await gameWindowRef.current.close();
      } catch {
        // already closed
      }
      gameWindowRef.current = null;
    }
    setGameRunning(false);
  }, []);

  useEffect(() => {
    if (!gameRunning) return;

    const checkInterval = setInterval(async () => {
      try {
        const stillOnGame = await invoke<boolean>("check_game_url");
        if (!stillOnGame) {
          console.log("[Game] User left Fortnite stream, closing game window");
          if (gameWindowRef.current) {
            try {
              await gameWindowRef.current.close();
            } catch {
              // already closed
            }
            gameWindowRef.current = null;
          }
          setGameRunning(false);
        }
      } catch {
        if (gameWindowRef.current) {
          gameWindowRef.current = null;
          setGameRunning(false);
        }
      }
    }, 3000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [gameRunning]);

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
            className="action-icon"
            title={t.launcher.github}
            onClick={() => { playClick(); open("https://github.com/shindozk/Fortnite-XCloud-PC"); }}
            onMouseEnter={playHover}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </button>
          <button className="action-icon" title={t.launcher.settings} onClick={() => { playOpen(); setShowSettings(true); }} onMouseEnter={playHover}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>
          <button className="action-icon" title={t.launcher.info} onClick={() => { playOpen(); setShowInfo(true); }} onMouseEnter={playHover}>
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
          {isLoading ? (
            <div className="loading-indicator">
              <div className="spinner" />
              <span>{t.launcher.checkingSession}</span>
            </div>
          ) : gameRunning ? (
            <button className="running-button" onClick={handleStopGame} onMouseEnter={playHover}>
              <span className="running-dot" />
              <span>{t.launcher.playing} ({formatTime(gameTime)})</span>
            </button>
          ) : session.is_logged_in ? (
            <button className="play-button" onClick={handlePlay} onMouseEnter={playHover}>
              <span>{t.launcher.play}</span>
            </button>
          ) : (
            <button
              className="login-button"
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
                <span>
                  {t.launcher.loginXbox}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="footer-right">
          <span className="version">{t.common.version}: {APP_VERSION}</span>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
