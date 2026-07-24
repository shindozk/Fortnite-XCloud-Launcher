use std::fs;
use std::path::PathBuf;

fn get_app_name() -> String {
    crate::commands::config::CONFIG.app.name.clone()
}

fn get_publisher() -> String {
    crate::commands::config::CONFIG.app.author.clone()
}

fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

fn get_install_dir() -> Result<PathBuf, String> {
    let local = dirs::data_local_dir().ok_or("Cannot find local app data".to_string())?;
    Ok(local.join("Fortnite-XCloud-Launcher"))
}

fn get_desktop_dir() -> Result<PathBuf, String> {
    dirs::desktop_dir()
        .or_else(|| dirs::home_dir())
        .ok_or("Cannot find desktop".to_string())
}

fn get_exe_path() -> Result<PathBuf, String> {
    std::env::current_exe().map_err(|e| e.to_string())
}

fn get_uninstaller_path(install_dir: &PathBuf) -> PathBuf {
    install_dir.join("uninstall.exe")
}

fn get_shortcut_path() -> Result<PathBuf, String> {
    let desktop = get_desktop_dir()?;
    let app_name = get_app_name();
    Ok(desktop.join(format!("{}.lnk", app_name)))
}

#[cfg(target_os = "windows")]
fn get_registry_key() -> Result<String, String> {
    Ok(format!(
        r#"Software\Microsoft\Windows\CurrentVersion\Uninstall\{}"#,
        "FortniteXCloudLauncher"
    ))
}

#[cfg(target_os = "windows")]
fn create_uninstaller(install_dir: &PathBuf, _exe_path: &PathBuf) -> Result<(), String> {
    let uninstaller_path = get_uninstaller_path(install_dir);

    let ps_script = format!(
        r#"
        $source = @"
using System;
using System.Diagnostics;
using System.IO;

class Uninstaller {{
    static void Main() {{
        string installDir = @"{install_dir}";
        string shortcutPath = @"{shortcut_path}";

        if (File.Exists(shortcutPath)) {{
            File.Delete(shortcutPath);
        }}

        try {{
            Directory.Delete(installDir, true);
        }} catch {{ }}

        try {{
            using (var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall", true)) {{
                key?.DeleteSubKeyTree("FortniteXCloudLauncher", false);
            }}
        }} catch {{ }}

        try {{
            Process.Start(new ProcessStartInfo {{
                FileName = "cmd.exe",
                Arguments = "/c timeout /t 2 >nul & rmdir /s /q \"" + installDir + "\"",
                WindowStyle = ProcessWindowStyle.Hidden,
                CreateNoWindow = true
            }});
        }} catch {{ }}
    }}
}}
"@

        Add-Type -TypeDefinition $source -OutputAssembly '{uninstaller_path}' -OutputType ConsoleApplication -Language CSharp
        "#,
        install_dir = install_dir.to_string_lossy().replace('\\', "\\\\"),
        shortcut_path = get_shortcut_path()
            .map(|p| p.to_string_lossy().replace('\\', "\\\\"))
            .unwrap_or_default(),
        uninstaller_path = uninstaller_path.to_string_lossy().replace('\\', "\\\\"),
    );

    std::process::Command::new("powershell")
        .args(["-Command", &ps_script])
        .output()
        .map_err(|e| format!("Failed to create uninstaller: {}", e))?;

    Ok(())
}

#[cfg(target_os = "windows")]
fn create_registry_entries(
    install_dir: &PathBuf,
    exe_path: &PathBuf,
) -> Result<(), String> {
    let uninstaller = get_uninstaller_path(install_dir);
    let key = get_registry_key()?;
    let app_name = get_app_name();
    let app_version = get_app_version();
    let publisher = get_publisher();

    let ps_script = format!(
        r#"
        $key = Get-ItemProperty -Path 'HKCU:\{key}' -ErrorAction SilentlyContinue
        if (-not $key) {{
            New-Item -Path 'HKCU:\{key}' -Force | Out-Null
        }}
        Set-ItemProperty -Path 'HKCU:\{key}' -Name 'DisplayName' -Value '{app_name}'
        Set-ItemProperty -Path 'HKCU:\{key}' -Name 'DisplayVersion' -Value '{app_version}'
        Set-ItemProperty -Path 'HKCU:\{key}' -Name 'Publisher' -Value '{publisher}'
        Set-ItemProperty -Path 'HKCU:\{key}' -Name 'InstallLocation' -Value '{install_dir}'
        Set-ItemProperty -Path 'HKCU:\{key}' -Name 'UninstallString' -Value '"{uninstaller}"'
        Set-ItemProperty -Path 'HKCU:\{key}' -Name 'QuietUninstallString' -Value '"{uninstaller}" /S'
        Set-ItemProperty -Path 'HKCU:\{key}' -Name 'DisplayIcon' -Value '{exe_path}'
        Set-ItemProperty -Path 'HKCU:\{key}' -Name 'NoModify' -Value 1 -Type DWord
        Set-ItemProperty -Path 'HKCU:\{key}' -Name 'NoRepair' -Value 1 -Type DWord
        Set-ItemProperty -Path 'HKCU:\{key}' -Name 'EstimatedSize' -Value 51200 -Type DWord
        "#,
        key = key,
        app_name = app_name,
        app_version = app_version,
        publisher = publisher,
        install_dir = install_dir.to_string_lossy().replace('\\', "\\\\"),
        uninstaller = uninstaller.to_string_lossy().replace('\\', "\\\\"),
        exe_path = exe_path.to_string_lossy().replace('\\', "\\\\"),
    );

    std::process::Command::new("powershell")
        .args(["-Command", &ps_script])
        .output()
        .map_err(|e| format!("Failed to create registry entries: {}", e))?;

    Ok(())
}

#[cfg(target_os = "windows")]
fn create_desktop_shortcut(
    install_dir: &PathBuf,
    exe_path: &PathBuf,
) -> Result<(), String> {
    let desktop = get_desktop_dir()?;
    let app_name = get_app_name();
    let shortcut_path = desktop.join(format!("{}.lnk", app_name));

    if shortcut_path.exists() {
        return Ok(());
    }

    let ps_script = format!(
        r#"
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut('{shortcut}')
        $Shortcut.TargetPath = '{exe}'
        $Shortcut.WorkingDirectory = '{workdir}'
        $Shortcut.Description = '{desc}'
        $Shortcut.IconLocation = '{exe}, 0'
        $Shortcut.Save()
        "#,
        shortcut = shortcut_path.to_string_lossy().replace('\\', "\\\\"),
        exe = exe_path.to_string_lossy().replace('\\', "\\\\"),
        workdir = install_dir.to_string_lossy().replace('\\', "\\\\"),
        desc = app_name,
    );

    std::process::Command::new("powershell")
        .args(["-Command", &ps_script])
        .output()
        .map_err(|e| format!("Failed to create shortcut: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn check_installed() -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        let key = get_registry_key()?;
        let app_name = get_app_name();
        let output = std::process::Command::new("powershell")
            .args([
                "-Command",
                &format!(
                    "Get-ItemProperty -Path 'HKCU:\\{}' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty DisplayName",
                    key
                ),
            ])
            .output()
            .map_err(|e| e.to_string())?;

        let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
        return Ok(!result.is_empty() && result == app_name);
    }

    #[cfg(not(target_os = "windows"))]
    {
        let install_dir = get_install_dir()?;
        Ok(install_dir.exists())
    }
}

#[tauri::command]
pub fn install_app() -> Result<String, String> {
    let install_dir = get_install_dir()?;
    fs::create_dir_all(&install_dir).map_err(|e| format!("Failed to create install dir: {}", e))?;

    let exe_path = get_exe_path()?;
    let target_exe = install_dir.join("FortniteXCloudLauncher.exe");

    if exe_path != target_exe {
        fs::copy(&exe_path, &target_exe).map_err(|e| format!("Failed to copy executable: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        create_uninstaller(&install_dir, &target_exe)?;
        create_registry_entries(&install_dir, &target_exe)?;
        create_desktop_shortcut(&install_dir, &target_exe)?;
    }

    #[cfg(target_os = "macos")]
    {
        let app_name = get_app_name();
        let applications = PathBuf::from("/Applications");
        let app_bundle = applications.join(format!("{}.app", app_name));
        fs::create_dir_all(app_bundle.join("Contents/MacOS"))
            .map_err(|e| format!("Failed to create app bundle: {}", e))?;
        fs::copy(
            &target_exe,
            app_bundle.join("Contents/MacOS").join(app_name),
        )
        .map_err(|e| format!("Failed to copy executable: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        let app_name = get_app_name();
        let bin_dir = PathBuf::from("/usr/local/bin");
        fs::create_dir_all(&bin_dir).map_err(|e| format!("Failed to create bin dir: {}", e))?;
        let target = bin_dir.join("fortnite-xcloud-launcher");
        fs::copy(&target_exe, &target).map_err(|e| format!("Failed to copy executable: {}", e))?;

        let desktop_entry = format!(
            r#"[Desktop Entry]
Name={}
Exec={}
Icon=fortnite-xcloud
Type=Application
Categories=Game;
"#,
            app_name,
            target.to_string_lossy(),
        );
        let desktop_file = dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".local/share/applications/fortnite-xcloud.desktop");
        fs::create_dir_all(desktop_file.parent().unwrap())
            .map_err(|e| format!("Failed to create desktop dir: {}", e))?;
        fs::write(&desktop_file, desktop_entry)
            .map_err(|e| format!("Failed to write desktop entry: {}", e))?;
    }

    Ok(format!("Installed to {}", install_dir.display()))
}

#[tauri::command]
pub fn get_install_path() -> Result<String, String> {
    let dir = get_install_dir()?;
    Ok(dir.to_string_lossy().to_string())
}

#[tauri::command]
pub fn uninstall_app() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let key = get_registry_key()?;
        let _ = std::process::Command::new("powershell")
            .args([
                "-Command",
                &format!(
                    "Remove-Item -Path 'HKCU:\\{}' -Recurse -Force -ErrorAction SilentlyContinue",
                    key
                ),
            ])
            .output();

        let uninstaller = get_uninstaller_path(&get_install_dir()?);
        if uninstaller.exists() {
            let _ = std::process::Command::new(&uninstaller).arg("/S").output();
            return Ok(());
        }
    }

    let install_dir = get_install_dir()?;
    if install_dir.exists() {
        fs::remove_dir_all(&install_dir).map_err(|e| format!("Failed to remove install dir: {}", e))?;
    }

    let shortcut = get_shortcut_path()?;
    if shortcut.exists() {
        fs::remove_file(&shortcut).map_err(|e| format!("Failed to remove shortcut: {}", e))?;
    }

    Ok(())
}
