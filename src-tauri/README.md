# Tauri Desktop App

This directory contains the Tauri desktop application configuration for FastFingers.

## Prerequisites

Before you can build the desktop app, you need to install Rust and system dependencies.

### Windows
1. Install Rust from https://rustup.rs/
2. Install Visual Studio Build Tools with C++ workload

### macOS
1. Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. Install Xcode Command Line Tools: `xcode-select --install`

### Linux (Ubuntu/Debian)
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install dependencies
sudo apt update
sudo apt install -y build-essential libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

## Building

### Development
```bash
npm run tauri:dev
```

### Production Build
```bash
npm run build:desktop
```

Output files will be in `target/release/bundle/`

## Icons

To generate icons for all platforms:

1. Create a 1024x1024 PNG icon
2. Run: `npx tauri icon path/to/icon.png`

Or manually place icons in the `icons` folder:
- `icon.ico` (Windows)
- `icon.icns` (macOS)
- `32x32.png`, `128x128.png`, `128x128@2x.png` (all platforms)

## Configuration

See `tauri.conf.json` for app configuration including:
- Window size and title
- Bundle settings
- Platform-specific options

## Troubleshooting

### Build fails on Linux
Make sure all dependencies are installed:
```bash
sudo apt install -y libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### Build fails on Windows
Make sure Visual Studio Build Tools is installed with C++ workload.

### Build fails on macOS
Make sure Xcode Command Line Tools is installed:
```bash
xcode-select --install
```
