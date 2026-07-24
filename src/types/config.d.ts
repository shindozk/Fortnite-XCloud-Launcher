declare module "@config" {
  const config: {
    app: {
      name: string;
      version: string;
      author: string;
      identifier: string;
      description: string;
    };
    oauth: {
      clientId: string;
      scope: string;
      redirectUri: string;
      authEndpoint: string;
    };
    game: {
      url: string;
      streamPath: string;
    };
    window: {
      width: number;
      height: number;
      minWidth: number;
      minHeight: number;
      title: string;
      userAgent: string;
    };
    github: {
      owner: string;
      repo: string;
    };
    discord: {
      appId: number;
    };
    update: {
      checkOnStartup: boolean;
      startupDelay: number;
      checkIntervalMs: number;
    };
    session: {
      storageKey: string;
    };
    language: {
      storageKey: string;
      fallback: string;
    };
    defaultSettings: {
      language: string;
      auto_save_session: boolean;
      auto_logout: boolean;
      stream_quality: string;
      bandwidth_adjust: boolean;
      latency_mode: boolean;
      theme: string;
      animations: boolean;
      vibrancy: boolean;
      discord_rpc: boolean;
    };
  };
  export default config;
}
