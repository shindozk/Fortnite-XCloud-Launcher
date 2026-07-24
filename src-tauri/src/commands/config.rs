use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct AppConfig {
    pub app: AppMeta,
    pub oauth: OAuthConfig,
    pub game: GameConfig,
    pub window: WindowConfig,
    pub github: GitHubConfig,
    pub discord: DiscordConfig,
    pub update: UpdateConfig,
    #[serde(default)]
    pub default_settings: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct AppMeta {
    pub name: String,
    pub version: String,
    pub author: String,
    pub identifier: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct OAuthConfig {
    pub client_id: String,
    pub scope: String,
    pub redirect_uri: String,
    pub auth_endpoint: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct GameConfig {
    pub url: String,
    pub stream_path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct WindowConfig {
    pub width: u32,
    pub height: u32,
    pub min_width: u32,
    pub min_height: u32,
    pub title: String,
    pub user_agent: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct GitHubConfig {
    pub owner: String,
    pub repo: String,
}

impl GitHubConfig {
    pub fn api_url(&self) -> String {
        format!("https://api.github.com/repos/{}/{}", self.owner, self.repo)
    }

    #[allow(dead_code)]
    pub fn releases_url(&self) -> String {
        format!("https://github.com/{}/{}/releases", self.owner, self.repo)
    }

    #[allow(dead_code)]
    pub fn latest_release_url(&self) -> String {
        format!(
            "https://github.com/{}/{}/releases/latest",
            self.owner, self.repo
        )
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct DiscordConfig {
    pub app_id: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct UpdateConfig {
    pub check_on_startup: bool,
    pub startup_delay: u64,
    pub check_interval_ms: u64,
}

pub fn load_config() -> AppConfig {
    let json = include_str!("../../../config.json");
    serde_json::from_str(json).expect("Failed to parse config.json")
}

pub static CONFIG: once_cell::sync::Lazy<AppConfig> = once_cell::sync::Lazy::new(load_config);
