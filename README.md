# Fortnite XCloud Launcher

A desktop client for playing Fortnite via Xbox Cloud Gaming (XCloud), built with Tauri 2.0, React, TypeScript, and Rust.

![Banner](src/assets/images/fortnite-banner.png)

## Features

- **Microsoft/Xbox Login** — OAuth 2.0 + PKCE authentication integrated with Microsoft accounts
- **Session Management** — Automatic session persistence and cookie management
- **Game Window** — Opens Fortnite streaming in a separate maximized window
- **Auto-detection** — Automatically detects when the user leaves the game stream
- **Play Timer** — Tracks total gameplay time per session
- **Splash Screen** — Animated loading screen on startup
- **System Installation** — Registers as a Windows application with uninstall support
- **35 Languages** — Full internationalization support with automatic OS language detection
- **Interface Sounds** — Click, hover, open/close, and toggle sound effects
- **Xbox-Style UI** — Settings modal with sidebar navigation, toggles, and animations
- **Custom Titlebar** — Frameless window with minimize, maximize, and close controls

## Supported Languages

English, Portuguese (Brazil/Portugal), Spanish, French, German, Italian, Japanese, Korean, Chinese (Simplified/Traditional), Russian, Arabic, Hindi, Thai, Vietnamese, Polish, Turkish, Dutch, Swedish, Danish, Finnish, Norwegian, Czech, Slovak, Hungarian, Romanian, Bulgarian, Croatian, Slovenian, Ukrainian, Indonesian, Malay, Filipino.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Rust, Tauri 2.0
- **Plugins:** @tauri-apps/plugin-shell
- **Audio:** Web Audio API (no external files)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

## Build

```bash
# Build for production
npm run tauri build

# Build without bundler (just the .exe)
npm run tauri build -- --bundles none

# Build NSIS installer only
npm run tauri build -- --bundles nsis
```

The output will be in `src-tauri/target/release/bundle/`.

## Project Structure

```
Fortnite-XCloud-PC/
├── src/
│   ├── assets/images/       # App images and icons
│   ├── components/          # React components
│   │   ├── Launcher.tsx     # Main launcher UI
│   │   ├── TitleBar.tsx     # Custom titlebar
│   │   ├── SettingsModal.tsx # Settings with tabs
│   │   ├── InfoModal.tsx    # Project info
│   │   └── SplashScreen.tsx # Loading screen
│   ├── contexts/
│   │   └── LanguageContext.tsx
│   ├── hooks/
│   ├── i18n/                # 35 language translations
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── languages/
│   ├── styles/              # CSS styles
│   ├── utils/
│   │   └── sounds.ts        # Web Audio API sounds
│   └── App.tsx
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs           # Tauri commands
│   │   ├── session.rs       # Session manager
│   │   ├── install.rs       # System installation
│   │   └── main.rs
│   ├── icons/               # App icons (all platforms)
│   ├── tauri.conf.json
│   └── Cargo.toml
└── package.json
```

## License

MIT

## Author

**shindozk** — [GitHub](https://github.com/shindozk)
