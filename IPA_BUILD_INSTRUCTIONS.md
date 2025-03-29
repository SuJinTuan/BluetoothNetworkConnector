# Building an IPA for ConnectivityApp

This guide provides detailed instructions for building an iOS IPA file from the ConnectivityApp project.

## Prerequisites

Before you begin, make sure you have the following:

1. Node.js and npm
2. Expo CLI: `npm install -g expo-cli`
3. EAS CLI: `npm install -g eas-cli`
4. An Expo account (create one at [expo.dev](https://expo.dev/signup))
5. An Apple Developer account ($99/year subscription)
6. Xcode installed on a Mac (iOS development requires macOS)

## Step 1: Log in to your Expo account

```bash
eas login
```

## Step 2: Configure your Apple Developer account with EAS

```bash
eas credentials
```

Follow the interactive prompts to set up your credentials for iOS development.

## Step 3: Configure EAS Build

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
      "ios": {
        "simulator": false
      }
    },
    "production": {}
  }
}
```

## Step 4: Configure app.json

Ensure your `app.json` file has the necessary iOS configuration:

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
        "ACCESS_FINE_LOCATION"
      ]
    },
    "plugins": [
      [
        "expo-build-properties",
        {
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

**Note:** Replace `"com.yourcompany.connectivityapp"` with your actual bundle identifier and `"your-project-id"` with your Expo project ID.

## Step 5: Register Your App ID with Apple

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Click the "+" button to register a new identifier
3. Select "App IDs" and click "Continue"
4. Enter a description and your bundle identifier (e.g., `com.yourcompany.connectivityapp`)
5. Select the capabilities your app needs (Bluetooth, etc.)
6. Click "Continue" and then "Register"

## Step 6: Create a Provisioning Profile

1. Go to [Provisioning Profiles](https://developer.apple.com/account/resources/profiles/list) in the Apple Developer Portal
2. Click the "+" button to create a new profile
3. Select "iOS App Development" for testing or "App Store" for distribution
4. Select the App ID you just created
5. Select the certificate to use
6. Select devices (for development profile)
7. Enter a profile name
8. Generate and download the profile

## Step 7: Build the IPA

For a development build that can be installed via TestFlight:

```bash
eas build -p ios --profile preview
```

This will:
1. Upload your code to Expo's build servers
2. Build the IPA
3. Provide a download link when complete

## Step 8: Distribution via TestFlight

1. Log in to [App Store Connect](https://appstoreconnect.apple.com/)
2. Go to "My Apps" and select your app (or create a new one)
3. Go to the "TestFlight" tab
4. Upload the build (this can also be done automatically by EAS if configured)
5. Add test information
6. Add testers (internal or external)
7. Wait for Apple's review (for external testers)

## Step 9: App Store Submission

1. In App Store Connect, go to the "App Store" tab
2. Fill in all required metadata:
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)
   - Privacy Policy URL
3. Add screenshots for each device type
4. Select the build you want to submit
5. Complete the "App Review Information" section
6. Set pricing and availability
7. Submit for review

## Testing on a Physical Device (Developer Mode)

1. Register your device in the Apple Developer Portal
2. Install the provisioning profile on your device
3. Connect your device to your Mac
4. Build and run the app using Xcode

## Troubleshooting

### Build Fails with Certificate Errors

Use the following command to troubleshoot and fix certificate issues:

```bash
eas credentials
```

### "App Not Available" when Installing via TestFlight

Ensure your App ID and provisioning profile are correctly set up. Also, make sure the device is added to the provisioning profile if you're using an Ad Hoc distribution.

### Missing Bluetooth Functionality

Ensure you've added the necessary Bluetooth permissions to the `info.plist` section in your `app.json`.

### Build Fails with Missing Entitlements

If your app uses specific capabilities (like Bluetooth, background modes, etc.), make sure they're properly configured in both your `app.json` and in the Apple Developer Portal for your App ID.

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple Developer Program](https://developer.apple.com/programs/)
- [TestFlight Overview](https://developer.apple.com/testflight/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)