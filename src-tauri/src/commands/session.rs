use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct SessionData {
    pub cookies: String,
    pub username: Option<String>,
    pub timestamp: i64,
}

pub struct SessionManager {
    session_path: PathBuf,
    session_data: Option<SessionData>,
}

impl Default for SessionManager {
    fn default() -> Self {
        let session_path = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("fortnite-xcloud-launcher")
            .join("session.json");
        Self {
            session_path,
            session_data: None,
        }
    }
}

impl SessionManager {
    pub fn new() -> Result<Self, String> {
        let session_path = Self::get_session_path()?;
        let session_data = Self::load_session_from_file(&session_path)?;
        Ok(Self {
            session_path,
            session_data,
        })
    }

    fn get_session_path() -> Result<PathBuf, String> {
        let data_dir = dirs::data_local_dir().ok_or("Could not find local data directory")?;
        let app_dir = data_dir.join("fortnite-xcloud-launcher");
        fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app directory: {}", e))?;
        Ok(app_dir.join("session.json"))
    }

    fn load_session_from_file(path: &PathBuf) -> Result<Option<SessionData>, String> {
        if !path.exists() {
            return Ok(None);
        }
        let data = fs::read_to_string(path).map_err(|e| format!("Failed to read session file: {}", e))?;
        let session: SessionData =
            serde_json::from_str(&data).map_err(|e| format!("Failed to parse session file: {}", e))?;
        Ok(Some(session))
    }

    pub fn is_session_valid(&self) -> bool {
        if let Some(ref data) = self.session_data {
            !data.cookies.is_empty()
        } else {
            false
        }
    }

    pub fn get_username(&self) -> Option<&String> {
        self.session_data.as_ref().and_then(|d| d.username.as_ref())
    }

    pub fn get_cookies(&self) -> Option<&String> {
        self.session_data.as_ref().map(|d| &d.cookies)
    }

    pub fn save_session(&mut self, cookies: &str, username: Option<&str>) -> Result<(), String> {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;

        let data = SessionData {
            cookies: cookies.to_string(),
            username: username.map(|s| s.to_string()),
            timestamp: now,
        };

        let json = serde_json::to_string_pretty(&data)
            .map_err(|e| format!("Failed to serialize session: {}", e))?;

        fs::write(&self.session_path, json)
            .map_err(|e| format!("Failed to write session file: {}", e))?;

        self.session_data = Some(data);
        Ok(())
    }

    pub fn clear_session(&mut self) -> Result<(), String> {
        if self.session_path.exists() {
            fs::remove_file(&self.session_path)
                .map_err(|e| format!("Failed to remove session file: {}", e))?;
        }
        self.session_data = None;
        Ok(())
    }
}
