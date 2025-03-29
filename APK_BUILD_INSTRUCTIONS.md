# Building an APK for ConnectivityApp

This guide provides detailed instructions for building an Android APK file from the ConnectivityApp project.

## Prerequisites

Before you begin, make sure you have the following installed:

1. Node.js and npm
2. Expo CLI: `npm install -g expo-cli`
3. EAS CLI: `npm install -g eas-cli`
4. An Expo account (create one at [expo.dev](https://expo.dev/signup))
5. Android Studio (for testing with an emulator)

## Step 1: Log in to your Expo account

```bash
eas login
```

## Step 2: Configure EAS Build

Create or modify the `eas.json` file in your project root (this file is already included in the project):

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## Step 3: Configure app.json

Ensure your `app.json` file has the necessary Android configuration:

```json
{
  "expo": {
    "name": "ConnectivityApp",
    "slug": "connectivity-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.connectivityapp",
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "This app uses Bluetooth to connect to and manage nearby devices.",
        "NSBluetoothPeripheralUsageDescription": "This app uses Bluetooth to connect to and manage nearby devices."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.connectivityapp",
      "permissions": [
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "BLUETOOTH_SCAN",
        "BLUETOOTH_CONNECT",
        "BLUETOOTH_ADVERTISE",
        "NEARBY_WIFI_DEVICES",
        "ACCESS_WIFI_STATE",
        "CHANGE_WIFI_STATE"
      ]
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 33,
            "targetSdkVersion": 33,
            "buildToolsVersion": "33.0.0"
          },
          "ios": {
            "deploymentTarget": "13.0"
          }
        }
      ]
    ],
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id" // Replace with your actual Expo project ID
      }
    }
  }
}
```

**Note:** Replace `"com.yourcompany.connectivityapp"` with your actual package name and `"your-project-id"` with your Expo project ID.

## Step 4: Install development build

```bash
eas build:configure
```

## Step 5: Build the APK

For a development/internal testing build:

```bash
eas build -p android --profile preview
```

This will:
1. Upload your code to Expo's build servers
2. Build the APK
3. Provide a download link when complete

## Step 6: Download and Install

1. When the build is complete, you'll receive a URL to download the APK.
2. Download the APK file to your device or transfer it to an Android device.
3. On your Android device, enable "Install from Unknown Sources" in Settings.
4. Install the APK by opening the downloaded file.

## Testing on an Emulator

1. Open Android Studio
2. Open AVD Manager (Android Virtual Device Manager)
3. Create a new virtual device or use an existing one
4. Start the emulator
5. Drag and drop the APK file onto the emulator window to install it

## Troubleshooting

### Build Fails with Permission Errors

Ensure you've configured the correct permissions in `app.json`. For newer Android versions (API 31+), you need specific Bluetooth and WiFi permissions.

### Cannot Connect to Bluetooth Devices

Make sure you're testing on a physical device as many emulators don't support Bluetooth properly.

### APK Size is Too Large

Consider using App Bundle format for production builds which optimizes the delivery size:

```bash
eas build -p android --profile production
```

### Build Fails with Library Compatibility Issues

Ensure all libraries are compatible with your SDK version. You may need to update or downgrade certain packages.

## Distribution

For distributing your app via Google Play Store:

1. Create a Google Play Developer account
2. Create a new application in the Google Play Console
3. Upload your AAB file (built with the production profile)
4. Complete the store listing information
5. Submit for review