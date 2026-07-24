import { useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LanguageProvider } from "./contexts/LanguageContext";
import UpdateNotifier from "./components/modals/UpdateNotifier";
import AppRoutes from "./AppRoutes";
import { useSessionStore } from "./stores";

function AppContent() {
  const { setSession, setLoading } = useSessionStore();

  const checkSession = useCallback(async () => {
    try {
      const status = await invoke<{ is_logged_in: boolean; username: string | null }>("check_session");
      setSession(status);
    } catch (err) {
      console.error("Failed to check session:", err);
    } finally {
      setLoading(false);
    }
  }, [setSession, setLoading]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <>
      <UpdateNotifier />
      <AppRoutes onLoginSuccess={checkSession} />
    </>
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
