# IPA Build Instructions

This document provides detailed instructions for building an iOS IPA from this project. These instructions are designed to guide you through the iOS build process, including preparing your environment, signing the app, and generating the final IPA file.

## Prerequisites

Before you begin, ensure you have the following:

- macOS computer (iOS apps can only be built on macOS)
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835) (latest version recommended)
- [CocoaPods](https://cocoapods.org/) (`sudo gem install cocoapods`)
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Apple Developer Account](https://developer.apple.com/) (paid account needed for distribution)
- [Git](https://git-scm.com/downloads) (for version control)

## Environment Setup

1. **Xcode Setup**:
   - Launch Xcode
   - Go to Preferences > Accounts
   - Add your Apple Developer account
   - Download the necessary signing certificates and provisioning profiles

2. **Project Setup**:
   - Install project dependencies:
     ```
     npm install
     ```

3. **iOS Specific Setup**:
   - Navigate to the iOS directory:
     ```
     cd ios
     ```
   - Install CocoaPods dependencies:
     ```
     pod install
     ```
   - This will create an `.xcworkspace` file which you'll use to open the project in Xcode

## Building with Expo

This project uses Expo, which simplifies the iOS build process:

1. **Install Expo CLI** (if not already installed):
   ```
   npm install -g expo-cli
   ```

2. **Login to your Expo account**:
   ```
   expo login
   ```

3. **Configure EAS Build**:
   The project already includes an `eas.json` configuration file that defines build profiles.

4. **Start an iOS build**:
   ```
   expo build:ios
   ```
   or for EAS builds:
   ```
   eas build --platform ios
   ```

5. Follow the prompts to select the desired build type (development, ad-hoc, or production)

6. The build will be processed on Expo's servers, and you'll receive a link to download the IPA when it's complete

## Manual Build Process (Without Expo)

If you prefer to build manually via Xcode:

1. **Open the Xcode Workspace**:
   ```
   open ios/ConnectivityApp.xcworkspace
   ```

2. **Configure Signing & Capabilities**:
   - Select the project in the Project Navigator
   - Select the main target (not the test target)
   - Go to the "Signing & Capabilities" tab
   - Select your Team and ensure signing is properly configured

3. **Select the Build Configuration**:
   - Choose the scheme (Debug or Release)
   - Select the target device (a physical iOS device is required for IPA generation)

4. **Build the App**:
   - Connect an iOS device (or select a simulator if you just want to test)
   - Click the "Build" button (triangular play icon) or use Command+B

5. **Archive for IPA Generation**:
   - Select a real device as the build target (not a simulator)
   - Choose "Product" > "Archive" from the menu
   - Once archiving is complete, the Organizer window will open

6. **Distribute the App**:
   - In the Organizer, select your archive
   - Click "Distribute App"
   - Follow the distribution wizard:
     - Choose "Development", "Ad Hoc", or "App Store Connect" distribution
     - Select the appropriate signing options
     - Choose "Export" to save the IPA file

## Troubleshooting Common Issues

### Build Failures

1. **Signing Issues**:
   - Verify your provisioning profiles are correctly installed
   - Check that your certificate is valid and not expired
   - Ensure your device is included in the provisioning profile (for development/ad-hoc builds)

2. **Dependency Issues**:
   - Try running `pod install` again
   - Update CocoaPods with `sudo gem install cocoapods`
   - Remove the Pods directory and Podfile.lock, then run `pod install` again

3. **Xcode Version Conflicts**:
   - Update the project to use your current Xcode version
   - Check for any warnings about deprecated APIs

4. **Simulator vs Device Issues**:
   - Some features only work on physical devices
   - Bluetooth and certain hardware features cannot be fully tested in the simulator

### Expo Specific Issues

1. **EAS Build Failures**:
   - Check the build logs for specific errors
   - Ensure your `eas.json` file is correctly configured
   - Verify your Expo account has the necessary permissions

2. **Credentials Issues**:
   - Run `eas credentials` to manage your iOS credentials
   - You may need to generate a new provisioning profile or certificate

## Installing the IPA

### On a Development Device

1. **Using Xcode**:
   - Connect your device to your Mac
   - Trust your Mac on the device if prompted
   - Select your device in Xcode and click "Run"

2. **Using iTunes** (older method):
   - Connect your device to your computer
   - Select your device in iTunes
   - Go to the "Apps" section
   - Drag and drop the IPA file to the Apps list
   - Click "Sync"

3. **Using Apple Configurator 2**:
   - Install [Apple Configurator 2](https://apps.apple.com/us/app/apple-configurator-2/id1037126344) from the Mac App Store
   - Connect your device
   - Drag and drop the IPA onto the device in Apple Configurator

### Distribution Methods

1. **TestFlight**:
   - Upload your build to App Store Connect
   - Add testers to your TestFlight testing team
   - Testers will receive an email invitation to install the app

2. **Ad Hoc Distribution**:
   - Create an Ad Hoc provisioning profile that includes the UDID of each test device
   - Build the app with this profile
   - Share the IPA file with your testers (via email, download link, etc.)
   - Testers will need to use one of the installation methods above

3. **In-House/Enterprise Distribution**:
   - Requires an Apple Enterprise Developer account
   - Build with an In-House distribution profile
   - Host the IPA file and a manifest.plist file on a server
   - Users can install directly from Safari by visiting a special URL

## Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- See the project's README.md for additional app-specific information