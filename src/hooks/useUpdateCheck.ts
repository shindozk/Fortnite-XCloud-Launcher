import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import { UPDATE_CONFIG } from "../config";
import { playOpen, playClose } from "../utils/sounds";

export interface UpdateInfo {
  available: boolean;
  current_version: string;
  latest_version: string;
  release_url: string;
  release_name: string;
  release_notes: string;
  published_at: string;
  download_url: string;
  asset_name: string;
  asset_size: number;
}

// localStorage key for per-version dismissal tracking
const DISMISS_KEY = "xcloud-launcher-dismissed-update";

function getDismissedVersion(): string | null {
  try {
    return localStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
}

function setDismissedVersion(version: string): void {
  try {
    localStorage.setItem(DISMISS_KEY, version);
  } catch {}
}

function clearDismissedVersion(): void {
  try {
    localStorage.removeItem(DISMISS_KEY);
  } catch {}
}

export function useUpdateCheck() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showNotif, setShowNotif] = useState(false);

  const checkForUpdates = useCallback(async () => {
    try {
      const info = await invoke<UpdateInfo>("check_for_update");
      if (!info.available) {
        setShowNotif(false);
        return;
      }

      // Auto-clear stale dismissal: if the user dismissed an older version
      // but a NEW version is now available, show it again.
      const dismissed = getDismissedVersion();
      if (dismissed && dismissed !== info.latest_version) {
        clearDismissedVersion();
      }

      if (!getDismissedVersion() || getDismissedVersion() !== info.latest_version) {
        setUpdateInfo(info);
        setShowNotif(true);
      }
    } catch (err) {
      console.error("[Update] Check failed:", err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates();
    }, UPDATE_CONFIG.startupDelay);
    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpdates();
    }, UPDATE_CONFIG.checkInterval);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  const handleDownload = useCallback(async () => {
    if (!updateInfo) return;
    if (updateInfo.download_url) {
      playOpen();
      await open(updateInfo.download_url);
    } else {
      playOpen();
      await open(updateInfo.release_url);
    }
  }, [updateInfo]);

  const handleDismiss = useCallback(() => {
    playClose();
    if (updateInfo) {
      setDismissedVersion(updateInfo.latest_version);
    }
    setShowNotif(false);
  }, [updateInfo]);

  const handleLater = useCallback(() => {
    playClose();
    setShowNotif(false);
  }, []);

  return {
    updateInfo,
    showNotif,
    handleDownload,
    handleDismiss,
    handleLater,
  };
}
