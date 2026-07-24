use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct GitHubRelease {
    #[serde(rename = "tag_name")]
    pub tag_name: String,
    pub name: String,
    pub body: String,
    #[serde(rename = "published_at")]
    pub published_at: String,
    #[serde(rename = "html_url")]
    pub html_url: String,
    pub assets: Vec<GitHubAsset>,
}

#[derive(Debug, Deserialize)]
pub struct GitHubAsset {
    pub name: String,
    pub size: u64,
    #[serde(rename = "browser_download_url")]
    pub browser_download_url: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub available: bool,
    pub current_version: String,
    pub latest_version: String,
    pub release_url: String,
    pub release_name: String,
    pub release_notes: String,
    pub published_at: String,
    pub download_url: String,
    pub asset_name: String,
    pub asset_size: u64,
}

fn get_current_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Pick the best matching asset for the user's platform.
/// Priority order matters: prefer specialized installers first.
fn pick_best_asset<'a>(assets: &'a [GitHubAsset]) -> Option<&'a GitHubAsset> {
    // 1) Windows installer (preferred): anything ending with -setup.exe
    if let Some(a) = assets.iter().find(|a| {
        let n = a.name.to_lowercase();
        n.ends_with("-setup.exe") || n.ends_with("_setup.exe") || n.ends_with("setup.exe")
    }) {
        return Some(a);
    }

    // 2) Windows MSI
    if let Some(a) = assets.iter().find(|a| a.name.to_lowercase().ends_with(".msi")) {
        return Some(a);
    }

    // 3) Plain Windows .exe (single-file builds)
    if let Some(a) = assets.iter().find(|a| a.name.to_lowercase().ends_with(".exe")) {
        return Some(a);
    }

    // 4) Linux AppImage
    if let Some(a) = assets.iter().find(|a| a.name.to_lowercase().ends_with(".appimage")) {
        return Some(a);
    }

    // 5) Linux .deb package
    if let Some(a) = assets.iter().find(|a| a.name.to_lowercase().ends_with(".deb")) {
        return Some(a);
    }

    // 6) macOS dmg
    if let Some(a) = assets.iter().find(|a| a.name.to_lowercase().ends_with(".dmg")) {
        return Some(a);
    }

    // 7) Generic archive fallbacks
    if let Some(a) = assets.iter().find(|a| {
        let n = a.name.to_lowercase();
        n.ends_with(".zip") || n.ends_with(".tar.gz") || n.ends_with(".tgz")
    }) {
        return Some(a);
    }

    None
}

#[tauri::command]
pub async fn check_for_update() -> Result<UpdateInfo, String> {
    let current_version = get_current_version();
    let github = &crate::commands::config::CONFIG.github;

    let client = reqwest::Client::builder()
        .user_agent(&format!(
            "{}/{}",
            crate::commands::config::CONFIG.app.name,
            current_version
        ))
        .timeout(std::time::Duration::from_secs(15))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!("{}/releases/latest", github.api_url());

    let resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to check for updates: {}", e))?;

    let status = resp.status();
    if !status.is_success() {
        if status.as_u16() == 403 {
            return Err("GitHub API rate limited. Please try again later.".to_string());
        }
        if status.as_u16() == 404 {
            return Err("No release published yet.".to_string());
        }
        return Err(format!("GitHub API returned status: {}", status));
    }

    let release: GitHubRelease = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse release info: {}", e))?;

    let latest_version = release.tag_name.trim_start_matches('v').to_string();
    let available = is_newer_version(&current_version, &latest_version);

    let (download_url, asset_name, asset_size) = pick_best_asset(&release.assets)
        .map(|a| {
            (
                a.browser_download_url.clone(),
                a.name.clone(),
                a.size,
            )
        })
        .unwrap_or_default();

    Ok(UpdateInfo {
        available,
        current_version,
        latest_version,
        release_url: release.html_url,
        release_name: release.name,
        release_notes: release.body,
        published_at: release.published_at,
        download_url,
        asset_name,
        asset_size,
    })
}

/// Compare two semver-like strings. Returns true if `latest` is strictly
/// newer than `current`. Non-numeric parts are ignored.
fn is_newer_version(current: &str, latest: &str) -> bool {
    fn parse(v: &str) -> Vec<u64> {
        v.split(|c: char| !c.is_ascii_digit())
            .filter_map(|s| s.parse::<u64>().ok())
            .collect()
    }

    let current_parts = parse(current);
    let latest_parts = parse(latest);
    let max_len = current_parts.len().max(latest_parts.len());

    for i in 0..max_len {
        let c = current_parts.get(i).copied().unwrap_or(0);
        let l = latest_parts.get(i).copied().unwrap_or(0);
        if l > c {
            return true;
        }
        if l < c {
            return false;
        }
    }
    false
}

#[tauri::command]
pub fn get_current_app_version() -> Result<String, String> {
    Ok(get_current_version())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_older() {
        assert!(!is_newer_version("2.1.0", "2.1.0"));
        assert!(!is_newer_version("2.1.0", "2.0.9"));
        assert!(!is_newer_version("2.1", "2.1.0"));
    }

    #[test]
    fn detects_newer() {
        assert!(is_newer_version("2.1.0", "2.2.0"));
        assert!(is_newer_version("2.1.0", "2.10.0"));
        assert!(is_newer_version("2.1.0", "3.0.0"));
        assert!(is_newer_version("1.9.9", "2.0.0"));
    }

    #[test]
    fn handles_v_prefix_and_text() {
        assert!(is_newer_version("2.1.0", "v2.2.0"));
        assert!(is_newer_version("2.1.0", "release-2.2.0"));
    }
}
