import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import characterImg from "../assets/images/fortnite-icon.png";
import "../styles/splash.css";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current <= 100) {
        setProgress(current);
      }
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-gradient" />
      <div className="splash-content">
        <div className="splash-icon-wrapper">
          <img
            src={characterImg}
            alt="Fortnite"
            className="splash-icon"
          />
        </div>
        <p className="splash-text">{t.common.loading}</p>
        <div className="splash-progress-track">
          <div
            className="splash-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
