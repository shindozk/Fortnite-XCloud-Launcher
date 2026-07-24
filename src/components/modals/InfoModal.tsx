import { useLanguage } from "../../contexts/LanguageContext";
import { APP_CONFIG } from "../../config";
import { playClose, playHover } from "../../utils/sounds";
import "../../styles/modals.css";

interface InfoModalProps {
  onClose: () => void;
}

export default function InfoModal({ onClose }: InfoModalProps) {
  const { t } = useLanguage();

  return (
    <div className="xbox-overlay" onClick={() => { playClose(); onClose(); }}>
      <div className="xbox-modal info-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="xbox-close" onClick={() => { playClose(); onClose(); }} onMouseEnter={playHover}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="info-content">
          <div className="info-header">
            <div className="info-logo">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#107C10">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <h2>Fortnite XCloud Launcher</h2>
            <span className="info-version">{t.info.version} {APP_CONFIG.version}</span>
          </div>

          <div className="info-body">
            <div className="info-section">
              <h3>{t.info.aboutProject}</h3>
              <p>{t.info.aboutProjectDesc}</p>
            </div>

            <div className="info-section">
              <h3>{t.info.features}</h3>
              <ul className="info-list">
                <li>{t.info.featureLogin}</li>
                <li>{t.info.featureSession}</li>
                <li>{t.info.featureInterface}</li>
                <li>{t.info.featureGameWindow}</li>
                <li>{t.info.featureDetection}</li>
                <li>{t.info.featureTimer}</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>{t.info.technologies}</h3>
              <div className="info-tags">
                <span className="info-tag">Tauri 2.0</span>
                <span className="info-tag">React</span>
                <span className="info-tag">TypeScript</span>
                <span className="info-tag">Rust</span>
                <span className="info-tag">Vite</span>
                <span className="info-tag">Zustand</span>
                <span className="info-tag">Liquid Glass</span>
              </div>
            </div>

            <div className="info-section">
              <h3>{t.info.links}</h3>
              <div className="info-links">
                <a
                  href={APP_CONFIG.github.releasesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                  onMouseEnter={playHover}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  {t.info.github}
                </a>
              </div>
            </div>
          </div>

          <div className="info-footer">
            <p>{t.info.madeBy} shindozk</p>
          </div>
        </div>
      </div>
    </div>
  );
}
