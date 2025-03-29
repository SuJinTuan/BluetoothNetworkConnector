# ConnectivityApp

ConnectivityApp is a React Native/Expo application that enables Bluetooth/WiFi connections and embeds H5 pages with bidirectional communication capabilities.

## Features

- Bluetooth device scanning and connection
- WiFi network scanning and connection
- H5/WebView embedding with two-way communication
- ZIP package handling for H5 content
- Export functionality for sharing content
- Cross-platform support (Android and iOS)

## Quick Start

### Option 1: Using One-Click Startup Scripts

#### For Mac/Linux users:
```bash
./start.sh
```

#### For Windows users:
```
start.bat
```

These scripts will:
1. Check for required dependencies (Node.js, npm, Expo CLI)
2. Install missing dependencies if needed
3. Start the Expo development server on port 5000
4. Display connection information

### Option 2: Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npx expo start --port=5000 --lan
```

## Accessing the App

After starting the development server:

1. Scan the QR code with:
   - Expo Go app (Android)
   - Camera app (iOS)
   
2. Or manually enter the Expo URL in the Expo Go app

## Building for Production

- For Android: See [APK_BUILD_INSTRUCTIONS.md](APK_BUILD_INSTRUCTIONS.md)
- For iOS: See [IPA_BUILD_INSTRUCTIONS.md](IPA_BUILD_INSTRUCTIONS.md)

## Project Structure

- `App.js` - Main application entry point
- `src/screens/` - Application screens
- `src/components/` - Reusable UI components
- `src/services/` - Core functionality services
- `src/contexts/` - React Context providers
- `src/utils/` - Utility functions and helpers
- `assets/html/` - Demo HTML content for WebView

## Key Services

- `BluetoothService.js` - Manages Bluetooth connections
- `WiFiService.js` - Handles WiFi network operations
- `WebViewBridge.js` - Enables communication between React Native and H5 pages
- `ZipService.js` - Processes ZIP packages for H5 content
- `ExportService.js` - Manages content export functionality