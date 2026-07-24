import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { buildAuthUrl } from "../utils/oauth";
import { WINDOW_CONFIG } from "../config";
import { useGameStore } from "../stores";
import { playOpen, playClose, playSuccess } from "../utils/sounds";

interface UseAuthOptions {
  onLoginSuccess: () => void;
}

export function useAuth({ onLoginSuccess }: UseAuthOptions) {
  const setIsLoggingIn = useGameStore((s) => s.setIsLoggingIn);

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
        userAgent: WINDOW_CONFIG.userAgent,
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

            const status = await invoke<{ is_logged_in: boolean; username: string | null }>("check_session");
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
  }, [onLoginSuccess, setIsLoggingIn]);

  return { handleLogin };
}
