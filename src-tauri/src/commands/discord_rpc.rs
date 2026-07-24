use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;

pub struct DiscordRpcManager {
    enabled: bool,
    client: Option<discord_rpc_client::Client>,
}

impl Default for DiscordRpcManager {
    fn default() -> Self {
        Self {
            enabled: false,
            client: None,
        }
    }
}

impl DiscordRpcManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set_enabled(&mut self, enabled: bool) -> Result<(), String> {
        if enabled == self.enabled {
            return Ok(());
        }

        if enabled {
            self.start()?;
        } else {
            self.stop();
        }

        self.enabled = enabled;
        Ok(())
    }

    fn start(&mut self) -> Result<(), String> {
        if self.client.is_some() {
            return Ok(());
        }

        let app_id = crate::commands::config::CONFIG.discord.app_id;
        eprintln!("[Discord RPC] Creating client for app_id: {}", app_id);
        let mut client = discord_rpc_client::Client::new(app_id);
        client.start();
        self.client = Some(client);
        self.enabled = true;

        eprintln!("[Discord RPC] Client started — IPC thread is connecting to Discord pipes");
        Ok(())
    }

    fn stop(&mut self) {
        if let Some(ref mut client) = self.client {
            client.clear_activity().ok();
        }
        self.client = None;
        self.enabled = false;
        eprintln!("[Discord RPC] Client stopped");
    }

    fn set_activity_inner(
        &mut self,
        details: &str,
        state_text: &str,
        start_timestamp: Option<i64>,
    ) -> Result<(), String> {
        // Auto-start the client if it's not running
        if self.client.is_none() {
            self.start()?;
        }

        // Retry logic: discord-rpc-client spawns a thread that connects to
        // Discord's named pipes (Windows) or unix sockets (unix). The first
        // set_activity call may arrive before the IPC connection is fully
        // established, so we retry up to 5 times with 1s delays.
        for attempt in 1..=5 {
            let result = if let Some(ref mut client) = self.client {
                let d = details.to_string();
                let s = state_text.to_string();
                client.set_activity(move |act| {
                    let act = act
                        .details(d)
                        .state(s)
                        .instance(true)
                        .assets(|assets| {
                            assets
                                .large_image("fortnite")
                                .large_text("Fortnite")
                                .small_image("xbox")
                                .small_text("Xbox Cloud Gaming")
                        });
                    if let Some(ts) = start_timestamp {
                        let ts_u64 = ts.max(0) as u64;
                        act.timestamps(|t| t.start(ts_u64))
                    } else {
                        act
                    }
                })
            } else {
                return Err("Discord RPC client not initialized".to_string());
            };

            match result {
                Ok(_payload) => {
                    eprintln!(
                        "[Discord RPC] Activity set (attempt {}): {} | {}",
                        attempt, details, state_text
                    );
                    return Ok(());
                }
                Err(e) => {
                    eprintln!(
                        "[Discord RPC] set_activity failed (attempt {}/5): {}",
                        attempt, e
                    );
                    if attempt < 5 {
                        std::thread::sleep(Duration::from_secs(1));
                    } else {
                        return Err(format!(
                            "Discord RPC failed after 5 attempts — make sure Discord is running and app_id {} is valid: {}",
                            crate::commands::config::CONFIG.discord.app_id,
                            e
                        ));
                    }
                }
            }
        }
        Ok(())
    }

    fn clear_activity_inner(&mut self) -> Result<(), String> {
        if let Some(ref mut client) = self.client {
            match client.clear_activity() {
                Ok(_payload) => {
                    eprintln!("[Discord RPC] Activity cleared");
                    Ok(())
                }
                Err(e) => {
                    eprintln!("[Discord RPC] Failed to clear activity: {}", e);
                    Ok(())
                }
            }
        } else {
            Ok(())
        }
    }
}

pub type SharedDiscordRpc = Arc<Mutex<DiscordRpcManager>>;

pub fn new_shared() -> SharedDiscordRpc {
    Arc::new(Mutex::new(DiscordRpcManager::new()))
}

pub async fn set_activity(
    rpc: &SharedDiscordRpc,
    details: String,
    state_text: String,
    start_timestamp: Option<i64>,
) -> Result<(), String> {
    let rpc = rpc.clone();
    tokio::task::spawn_blocking(move || {
        let mut mgr = rpc.blocking_lock();
        mgr.set_activity_inner(&details, &state_text, start_timestamp)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

pub async fn clear_activity(rpc: &SharedDiscordRpc) -> Result<(), String> {
    let rpc = rpc.clone();
    tokio::task::spawn_blocking(move || {
        let mut mgr = rpc.blocking_lock();
        mgr.clear_activity_inner()
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

pub async fn set_enabled(rpc: &SharedDiscordRpc, enabled: bool) -> Result<(), String> {
    let rpc = rpc.clone();
    tokio::task::spawn_blocking(move || {
        let mut mgr = rpc.blocking_lock();
        mgr.set_enabled(enabled)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}
