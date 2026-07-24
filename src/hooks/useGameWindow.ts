import { useCallback, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { GAME_CONFIG, WINDOW_CONFIG } from "../config";
import { useGameStore } from "../stores";
import { useLanguage } from "../contexts/LanguageContext";
import { playStart, playStop } from "../utils/sounds";

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  "pt-BR": "pt-BR",
  "pt-PT": "pt-PT",
  es: "es-ES",
  "es-MX": "es-MX",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  ru: "ru-RU",
  ar: "ar-SA",
  hi: "hi-IN",
  th: "th-TH",
  vi: "vi-VN",
  pl: "pl-PL",
  tr: "tr-TR",
  nl: "nl-NL",
  sv: "sv-SE",
  da: "da-DK",
  fi: "fi-FI",
  no: "nb-NO",
  cs: "cs-CZ",
  sk: "sk-SK",
  hu: "hu-HU",
  ro: "ro-RO",
  bg: "bg-BG",
  hr: "hr-HR",
  sl: "sl-SI",
  uk: "uk-UA",
  id: "id-ID",
  ms: "ms-MY",
  tl: "fil-PH",
};

async function pushDiscordActivity() {
  try {
    await invoke("discord_set_activity", {
      details: "Playing Fortnite",
      stateText: "Xbox Cloud Gaming",
      startTimestamp: Math.floor(Date.now() / 1000),
    });
  } catch (err) {
    console.error("[Discord RPC] Refresh failed:", err);
  }
}

export function useGameWindow() {
  const { language } = useLanguage();
  const setGameRunning = useGameStore((s) => s.setGameRunning);
  const setGameTime = useGameStore((s) => s.setGameTime);
  const gameWindowRef = useRef<WebviewWindow | null>(null);
  const startTimestampRef = useRef<number>(0);

  const handlePlay = useCallback(async () => {
    playStart();
    try {
      const parentWindow = getCurrentWindow();
      const parentSize = await parentWindow.innerSize();

      const gameWindow = new WebviewWindow("game-window", {
        url: GAME_CONFIG.url,
        title: "Fortnite - XCloud",
        width: parentSize.width,
        height: parentSize.height,
        center: true,
        maximized: true,
        resizable: true,
        decorations: true,
        userAgent: WINDOW_CONFIG.userAgent,
      });

      gameWindowRef.current = gameWindow;
      startTimestampRef.current = Math.floor(Date.now() / 1000);

      // Set up listeners BEFORE marking game as running
      gameWindow.listen("tauri://destroyed", () => {
        console.log("[Game] Window destroyed");
        invoke("discord_clear_activity").catch(() => {});
        gameWindowRef.current = null;
        startTimestampRef.current = 0;
        setGameRunning(false);
      });

      gameWindow.once("tauri://error", () => {
        console.log("[Game] Window error");
        invoke("discord_clear_activity").catch(() => {});
        gameWindowRef.current = null;
        startTimestampRef.current = 0;
        setGameRunning(false);
      });

      gameWindow.once("tauri://created", async () => {
        try {
          const webviewLang = LANG_MAP[language] || "en-US";
          (gameWindow as unknown as { eval: (js: string) => Promise<void> }).eval(
            `document.documentElement.lang = '${webviewLang}';`
          ).catch(() => {});
        } catch {}
      });

      setGameRunning(true);

      // Send initial activity
      await pushDiscordActivity();
    } catch (err) {
      console.error("Failed to open game window:", err);
      setGameRunning(false);
    }
  }, [setGameRunning, language]);

  const handleStopGame = useCallback(async () => {
    playStop();
    invoke("discord_clear_activity").catch(() => {});
    if (gameWindowRef.current) {
      try {
        await gameWindowRef.current.close();
      } catch {
        // already closed
      }
      gameWindowRef.current = null;
    }
    startTimestampRef.current = 0;
    setGameRunning(false);
  }, [setGameRunning]);

  // Timer + per-second Discord refresh, driven by gameRunning state changes
  useEffect(() => {
    let timerId: ReturnType<typeof setInterval> | null = null;
    let discordId: ReturnType<typeof setInterval> | null = null;

    const clearAll = () => {
      if (timerId) { clearInterval(timerId); timerId = null; }
      if (discordId) { clearInterval(discordId); discordId = null; }
    };

    const startTimers = () => {
      console.log("[Game] Starting timer + Discord refresh");
      setGameTime(0);

      // Per-second UI timer
      timerId = setInterval(() => {
        const next = (useGameStore.getState().gameTime ?? 0) + 1;
        setGameTime(next);
      }, 1000);

      // Per-second Discord refresh so the activity stays "alive" and elapsed
      // time updates continuously as long as the window is open.
      discordId = setInterval(async () => {
        const { gameRunning } = useGameStore.getState();
        if (!gameRunning || startTimestampRef.current === 0) return;
        await pushDiscordActivity();
      }, 1000);
    };

    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      if (state.gameRunning && !prevState.gameRunning && !timerId) {
        startTimers();
      } else if (!state.gameRunning && prevState.gameRunning && timerId) {
        console.log("[Game] Stopping timers");
        clearAll();
        setGameTime(0);
      }
    });

    if (useGameStore.getState().gameRunning && !timerId) {
      startTimers();
    }

    return () => {
      unsubscribe();
      clearAll();
    };
  }, [setGameRunning, setGameTime]);

  return { handlePlay, handleStopGame };
}
