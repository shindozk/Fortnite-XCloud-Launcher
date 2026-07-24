import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import SplashScreen from "./components/pages/SplashScreen";
import Launcher from "./components/pages/Launcher";

function SplashPage() {
  const navigate = useNavigate();
  return <SplashScreen onComplete={() => navigate("/launcher")} />;
}

interface AppRoutesProps {
  onLoginSuccess: () => void;
}

export default function AppRoutes({ onLoginSuccess }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/splash" element={<SplashPage />} />
      <Route path="/launcher" element={<Launcher onLoginSuccess={onLoginSuccess} />} />
      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  );
}
