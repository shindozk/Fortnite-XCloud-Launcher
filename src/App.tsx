import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LanguageProvider } from "./contexts/LanguageContext";
import SplashScreen from "./components/SplashScreen";
import Launcher from "./components/Launcher";
import "./styles/app.css";

interface SessionStatus {
  is_logged_in: boolean;
  username: string | null;
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState<SessionStatus>({
    is_logged_in: false,
    username: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const status = await invoke<SessionStatus>("check_session");
      setSession(status);
    } catch (err) {
      console.error("Failed to check session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleLoginSuccess = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  const handleLogout = useCallback(async () => {
    try {
      await invoke("clear_session");
      setSession({ is_logged_in: false, username: null });
    } catch (err) {
      console.error("Failed to clear session:", err);
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Launcher
      session={session}
      isLoading={isLoading}
      onLoginSuccess={handleLoginSuccess}
      onLogout={handleLogout}
    />
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
