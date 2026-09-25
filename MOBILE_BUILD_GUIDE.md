# Aura Video Pro — Mobile App Store & Packaging Guide

This guide details how to build, test, and release **Aura Video Pro** across **Mobile (iOS / Android)**, **Desktop (Electron / Tauri)**, and **Progressive Web App (PWA)**.

---

## 1. Architecture Overview

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS.
- **Backend API**: Node.js + Express + TypeScript.
- **Rendering Engine**: Native FFmpeg 5.x / 6.x + FFprobe.
- **AI Cutout Pipeline**: Python 3.x + OpenCV 5.x GrabCut & rembg ONNX.
- **Mobile Foundation**: Capacitor / PWA standalone architecture.

---

## 2. Progressive Web App (PWA) / Instant Mobile Install

Aura Video Pro is pre-configured with a Web App Manifest (`client/public/manifest.json`) and responsive touch viewport controls:

1. Build client:
   ```bash
   cd client
   npm run build
   ```
2. On any modern smartphone browser (Safari iOS or Chrome Android), navigate to your deployed Aura Video Pro instance.
3. Tap **Share** (iOS) or **Options Menu** (Android) and choose **Add to Home Screen**.
4. The application installs as a standalone, fullscreen native-like app with dark status bar (`#070709`) and zero browser address bars.

---

## 3. Building for iOS & Android via Capacitor

To compile native `.apk` / `.aab` for Google Play Store or `.ipa` for Apple App Store:

### Step 1: Install Capacitor CLI & Platforms
```bash
cd client
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

### Step 2: Initialize & Sync Assets
```bash
npx cap init "Aura Video Pro" "pro.auravideo.app" --web-dir dist
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

### Step 3: Run in Native IDEs
- **Android**:
  ```bash
  npx cap open android
  ```
  *(Opens Android Studio. From there, select **Build > Generate Signed Bundle / APK** for Google Play release).*
- **iOS**:
  ```bash
  npx cap open ios
  ```
  *(Opens Xcode on macOS. Configure Signing & Capabilities, select Any iOS Device (arm64), and click **Product > Archive** to upload to App Store Connect).*

---

## 4. Packaging Desktop Installers (Electron)

To create Windows `.exe` / macOS `.dmg` / Linux `.AppImage` desktop applications:

```bash
cd client
npm install -D electron electron-builder
```

Configure `package.json` with main entry `electron/main.js` and build with:
```bash
npx electron-builder --win
```

---

## 5. Production Server Deployment

1. **Build Backend**:
   ```bash
   cd server
   npm run build
   ```
2. **Launch Node Backend**:
   ```bash
   node dist/index.js
   ```
3. **Ensure FFmpeg is installed** on the server PATH (`ffmpeg -version`).
4. **Ensure Python environment** has `opencv-python` and `numpy` installed for AI background removal.
