import { useLanguage } from "../../contexts/LanguageContext";
import { useUpdateCheck } from "../../hooks";
import { playHover } from "../../utils/sounds";
import "../../styles/update.css";

export default function UpdateNotifier() {
  const { t } = useLanguage();
  const { updateInfo, showNotif, handleDownload, handleDismiss, handleLater } = useUpdateCheck();

  if (!showNotif || !updateInfo) return null;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="update-overlay" onClick={handleLater}>
      <div className="update-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="update-header">
          <div className="update-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="update-title-group">
            <h3 className="update-title">{t.update.title}</h3>
            <span className="update-subtitle">{t.update.newVersionAvailable}</span>
          </div>
        </div>

        <div className="update-body">
          <div className="update-versions">
            <div className="update-version-item">
              <span className="version-label">{t.update.currentVersion}</span>
              <span className="version-value">{updateInfo.current_version}</span>
            </div>
            <div className="update-version-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </div>
            <div className="update-version-item">
              <span className="version-label">{t.update.latestVersion}</span>
              <span className="version-value latest">{updateInfo.latest_version}</span>
            </div>
          </div>

          {updateInfo.asset_name && (
            <div className="update-file-info">
              <span>{updateInfo.asset_name}</span>
              {updateInfo.asset_size > 0 && (
                <span className="update-size">{formatSize(updateInfo.asset_size)}</span>
              )}
            </div>
          )}

          {updateInfo.release_notes && (
            <div className="update-notes">
              <span className="update-notes-title">{t.update.updateNotes}</span>
              <div className="update-notes-content">
                {updateInfo.release_notes.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="update-actions">
          <button className="update-btn-secondary" onClick={handleDismiss} onMouseEnter={playHover}>
            {t.update.dismiss}
          </button>
          <button className="update-btn-secondary" onClick={handleLater} onMouseEnter={playHover}>
            {t.update.later}
          </button>
          <button className="update-btn-primary glass-btn-green" onClick={handleDownload} onMouseEnter={playHover}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            {t.update.download}
          </button>
        </div>
      </div>
    </div>
  );
}
