mod session;
mod install;

use session::SessionManager;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{Manager, State};

pub struct AppState {
    pub session_manager: Mutex<SessionManager>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionStatus {
    pub is_logged_in: bool,
    pub username: Option<String>,
}

#[tauri::command]
fn check_session(state: State<'_, AppState>) -> Result<SessionStatus, String> {
    let manager = state
        .session_manager
        .lock()
        .map_err(|e| e.to_string())?;
    let is_logged_in = manager.is_session_valid();
    let username = manager.get_username().cloned();
    Ok(SessionStatus {
        is_logged_in,
        username,
    })
}

#[tauri::command]
fn save_session(
    state: State<'_, AppState>,
    cookies: String,
    username: Option<String>,
) -> Result<(), String> {
    let mut manager = state
        .session_manager
        .lock()
        .map_err(|e| e.to_string())?;
    manager.save_session(&cookies, username.as_deref())
}

#[tauri::command]
fn mark_logged_in(state: State<'_, AppState>) -> Result<(), String> {
    let mut manager = state
        .session_manager
        .lock()
        .map_err(|e| e.to_string())?;
    manager.save_session("auth-completed", Some("Xbox User"))
}

#[tauri::command]
fn check_auth_url(app: tauri::AppHandle) -> Result<bool, String> {
    let windows = app.webview_windows();
    for (label, window) in windows.iter() {
        if label == "auth-window" {
            match window.url() {
                Ok(url) => {
                    let url_str = url.to_string();
                    if url_str.contains("play.xbox.com") && !url_str.contains("login.live.com") {
                        return Ok(true);
                    }
                }
                Err(_) => {}
            }
        }
    }
    Ok(false)
}

#[tauri::command]
async fn check_game_url(app: tauri::AppHandle) -> Result<bool, String> {
    let windows = app.webview_windows();
    for (label, window) in windows.iter() {
        if label == "game-window" {
            let webview = window.as_ref();
            let result: std::sync::Arc<std::sync::Mutex<Option<String>>> =
                std::sync::Arc::new(std::sync::Mutex::new(None));
            let result_clone = result.clone();
            webview
                .eval_with_callback("window.location.href", move |url_str| {
                    if let Ok(mut guard) = result_clone.lock() {
                        *guard = Some(url_str);
                    }
                })
                .map_err(|e| e.to_string())?;
            tokio::time::sleep(std::time::Duration::from_millis(100)).await;
            let url = {
                if let Ok(guard) = result.lock() {
                    guard.clone()
                } else {
                    None
                }
            };
            if let Some(url_str) = url {
                return Ok(url_str.contains("/stream/"));
            }
        }
    }
    Ok(false)
}

#[tauri::command]
fn clear_session(state: State<'_, AppState>) -> Result<(), String> {
    let mut manager = state
        .session_manager
        .lock()
        .map_err(|e| e.to_string())?;
    manager.clear_session()
}

#[tauri::command]
fn get_saved_cookies(state: State<'_, AppState>) -> Result<Option<String>, String> {
    let manager = state
        .session_manager
        .lock()
        .map_err(|e| e.to_string())?;
    Ok(manager.get_cookies().cloned())
}

#[tauri::command]
fn get_os_locale() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let output = Command::new("powershell")
            .args(["-Command", "[System.Globalization.CultureInfo]::CurrentCulture.Name"])
            .output()
            .map_err(|e| e.to_string())?;
        let locale = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if !locale.is_empty() {
            return Ok(locale);
        }
    }

    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let output = Command::new("defaults")
            .args(["read", "NSGlobalDomain", "AppleLanguages"])
            .output()
            .map_err(|e| e.to_string())?;
        let raw = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if let Some(first) = raw.strip_prefix('(').and_then(|s| s.strip_suffix(')')) {
            let locale = first.split(',').next().unwrap_or("").trim().trim_matches('"').to_string();
            if !locale.is_empty() {
                return Ok(locale);
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        if let Ok(output) = Command::new("bash").args(["-c", "echo $LANG"]).output() {
            let locale = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !locale.is_empty() && locale != "C" && locale != "POSIX" {
                return Ok(locale);
            }
        }
    }

    Ok(std::env::var("LANG")
        .or_else(|_| std::env::var("LC_ALL"))
        .unwrap_or_else(|_| "en-US".to_string()))
}

#[tauri::command]
fn set_webview_language(app: tauri::AppHandle, language: String) -> Result<(), String> {
    let windows = app.webview_windows();
    for (_label, window) in windows.iter() {
        let lang_str = language.clone();
        let webview = window.as_ref();
        let js = format!("document.documentElement.lang = '{}';", lang_str);
        webview.eval(&js).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let session_manager = SessionManager::new().unwrap_or_else(|_| SessionManager::default());

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            session_manager: Mutex::new(session_manager),
        })
        .invoke_handler(tauri::generate_handler![
            check_session,
            save_session,
            mark_logged_in,
            check_auth_url,
            check_game_url,
            clear_session,
            get_saved_cookies,
            get_os_locale,
            set_webview_language,
            install::check_installed,
            install::install_app,
            install::get_install_path,
            install::uninstall_app,
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_title("Fortnite XCloud Launcher")?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
