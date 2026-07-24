use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub language: String,
    pub auto_save_session: bool,
    pub auto_logout: bool,
    pub stream_quality: String,
    pub bandwidth_adjust: bool,
    pub latency_mode: bool,
    pub theme: String,
    pub animations: bool,
    pub vibrancy: bool,
    pub discord_rpc: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        let defaults = &crate::commands::config::CONFIG.default_settings;
        let d = defaults.as_ref();

        Self {
            language: d.map(|v| v["language"].as_str().unwrap_or("en").to_string()).unwrap_or_else(|| "en".to_string()),
            auto_save_session: d.map(|v| v["auto_save_session"].as_bool().unwrap_or(true)).unwrap_or(true),
            auto_logout: d.map(|v| v["auto_logout"].as_bool().unwrap_or(false)).unwrap_or(false),
            stream_quality: d.map(|v| v["stream_quality"].as_str().unwrap_or("auto").to_string()).unwrap_or_else(|| "auto".to_string()),
            bandwidth_adjust: d.map(|v| v["bandwidth_adjust"].as_bool().unwrap_or(true)).unwrap_or(true),
            latency_mode: d.map(|v| v["latency_mode"].as_bool().unwrap_or(true)).unwrap_or(true),
            theme: d.map(|v| v["theme"].as_str().unwrap_or("dark").to_string()).unwrap_or_else(|| "dark".to_string()),
            animations: d.map(|v| v["animations"].as_bool().unwrap_or(true)).unwrap_or(true),
            vibrancy: d.map(|v| v["vibrancy"].as_bool().unwrap_or(false)).unwrap_or(false),
            discord_rpc: d.map(|v| v["discord_rpc"].as_bool().unwrap_or(false)).unwrap_or(false),
        }
    }
}

pub struct SettingsManager {
    settings_path: PathBuf,
    settings: AppSettings,
}

impl Default for SettingsManager {
    fn default() -> Self {
        let settings_path = Self::get_settings_path().unwrap_or_else(|_| PathBuf::from("settings.json"));
        let settings = Self::load_from_file(&settings_path).unwrap_or_default();
        Self {
            settings_path,
            settings,
        }
    }
}

impl SettingsManager {
    pub fn new() -> Result<Self, String> {
        let settings_path = Self::get_settings_path()?;
        let settings = Self::load_from_file(&settings_path).unwrap_or_default();
        Ok(Self {
            settings_path,
            settings,
        })
    }

    fn get_settings_path() -> Result<PathBuf, String> {
        let data_dir = dirs::data_local_dir().ok_or("Could not find local data directory")?;
        let app_dir = data_dir.join("fortnite-xcloud-launcher");
        fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app directory: {}", e))?;
        Ok(app_dir.join("settings.json"))
    }

    fn load_from_file(path: &PathBuf) -> Result<AppSettings, String> {
        if !path.exists() {
            return Ok(AppSettings::default());
        }
        let data = fs::read_to_string(path).map_err(|e| format!("Failed to read settings file: {}", e))?;
        let settings: AppSettings =
            serde_json::from_str(&data).map_err(|e| format!("Failed to parse settings file: {}", e))?;
        Ok(settings)
    }

    pub fn get_settings(&self) -> AppSettings {
        self.settings.clone()
    }

    pub fn save_settings(&mut self, new_settings: AppSettings) -> Result<(), String> {
        let json = serde_json::to_string_pretty(&new_settings)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;

        fs::write(&self.settings_path, json)
            .map_err(|e| format!("Failed to write settings file: {}", e))?;

        self.settings = new_settings;
        Ok(())
    }
}
