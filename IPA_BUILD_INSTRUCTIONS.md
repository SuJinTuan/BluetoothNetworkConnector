# Building an IPA for ConnectivityApp (iOS)

Building an iOS IPA file for ConnectivityApp requires macOS and an Apple Developer account. Here are the steps to build an IPA file for your iOS app:

## Prerequisites

1. **macOS Computer**: You must use a Mac to build iOS apps
2. **Xcode**: Install the latest version from the Mac App Store
3. **Apple Developer Account**: Enroll in the Apple Developer Program ($99/year)
4. **Certificates and Provisioning Profiles**: Set up through Apple Developer Portal

## Option 1: Using EAS Build (Recommended)

EAS (Expo Application Services) is the easiest way to build iOS apps with Expo:

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Log in to your Expo account:
```bash
eas login
```

3. Configure your iOS build:
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build -p ios --profile preview
```

This will build your app on Expo's servers and provide a link to download the IPA file.

## Option 2: Building Locally on macOS

If you need to build the IPA locally:

1. Run Expo prebuild command:
```bash
npx expo prebuild --platform ios
```

2. Open the generated Xcode project:
```bash
open ios/ConnectivityApp.xcworkspace
```

3. In Xcode:
   - Sign in with your Apple ID under Preferences > Accounts
   - Select your Team in the Signing & Capabilities tab
   - Change the Bundle Identifier if needed
   - Set the device target (e.g., "Any iOS Device")

4. Build the app in Xcode:
   - Product > Archive
   - In the Organizer window that appears, click "Distribute App"
   - Choose "Development", "Ad Hoc", or "App Store Connect" distribution
   - Follow the prompts to create the IPA

5. Find your IPA in the location Xcode specifies at the end of the process

## iOS-Specific Configuration

Your app.json already contains necessary iOS configuration:

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.yourcompany.connectivityapp",
  "infoPlist": {
    "NSBluetoothAlwaysUsageDescription": "This app uses Bluetooth to connect to other devices.",
    "NSBluetoothPeripheralUsageDescription": "This app uses Bluetooth to connect to other devices.",
    "NSLocationWhenInUseUsageDescription": "This app uses your location to scan for nearby WiFi networks.",
    "NSLocationAlwaysUsageDescription": "This app uses your location to scan for nearby WiFi networks.",
    "UIBackgroundModes": ["bluetooth-central"]
  }
}
```

You may need to add additional configurations depending on your specific distribution needs.

## Required Apple Developer Account Resources

1. **Certificates**:
   - iOS Development Certificate (for development builds)
   - iOS Distribution Certificate (for App Store or Ad Hoc distribution)

2. **Provisioning Profiles**:
   - Development Provisioning Profile (for testing on devices)
   - Ad Hoc Provisioning Profile (for distribution to specific devices)
   - App Store Provisioning Profile (for App Store submission)

3. **App ID**:
   - Register your bundle identifier in the Apple Developer Portal

## Important Notes for iOS Development

1. **Physical iOS Device Testing**: To test on a physical device, you need to register the device's UDID in your Apple Developer account

2. **Bluetooth/WiFi Permissions**: iOS has strict requirements for Bluetooth and WiFi access. Your app must include proper usage descriptions in Info.plist (already configured in app.json)

3. **Distribution Options**:
   - **Development**: For testing on registered devices only
   - **Ad Hoc**: For distribution to specific registered devices without the App Store
   - **TestFlight**: For beta testing through the App Store
   - **App Store**: For public distribution

4. **Simulator Builds**: You can build for the iOS Simulator during development, but these builds cannot be installed on physical devices