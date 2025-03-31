# USB Debugging Guide

This guide will help you set up and troubleshoot USB debugging for the ConnectivityApp on Android and iOS devices. USB debugging is essential for testing Bluetooth and WiFi functionality on physical devices, as these features are not fully supported in emulators/simulators.

## Why USB Debugging is Important

For this app in particular, USB debugging is critical because:

1. Bluetooth and WiFi functions require access to actual hardware
2. Device-specific issues may only appear on physical devices
3. You can test on multiple Android OS versions and device manufacturers
4. Performance testing is much more accurate on real devices

## Android USB Debugging Setup

### Prerequisites

- [Android Studio](https://developer.android.com/studio) installed
- USB cable (preferably the one that came with your device)
- Android device with Developer Options enabled

### Enabling Developer Options

1. On your Android device, go to **Settings** > **About phone**
2. Locate the **Build number** entry (this might be under "Software information" on some devices)
3. Tap **Build number** 7 times until you see a message that says "You are now a developer!"
4. Go back to the main Settings screen, you should now see **Developer options**

### Enabling USB Debugging

1. Go to **Settings** > **Developer options**
2. Enable the **USB debugging** toggle
3. (Optional but recommended) Enable **Stay awake** to keep the screen on while charging

### Connecting Your Device

1. Connect your device to your computer via USB
2. When prompted on your device, tap **Allow** to authorize USB debugging
3. (Optional) Check "Always allow from this computer" to avoid future prompts

### Testing the Connection

1. Open a terminal/command prompt and run:
   ```
   adb devices
   ```
2. You should see your device listed with a device ID and "device" status
3. If it shows "unauthorized", check your device for the authorization prompt

### Running the App via USB Debugging

Use the provided script to simplify USB debugging:

**For Windows:**
```
start_usb_debug.bat
```

**For macOS/Linux:**
```
./start_usb_debug.sh
```

This script will:
1. Ensure ADB is running
2. Detect connected devices
3. Install and launch the app on your device
4. Start logcat to view app logs

## iOS USB Debugging Setup

### Prerequisites

- Mac computer (required for iOS development)
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835) installed
- USB cable (preferably the one that came with your device)
- iOS device (iPhone or iPad)
- Apple Developer account (free account works for development)

### Preparing Your iOS Device

1. Connect your iOS device to your Mac
2. Open **Settings** on your iOS device
3. Go to **Privacy** > **Developer Mode** and enable it (iOS 16+ only)
4. When prompted, restart your device

### Configuring Xcode

1. Open Xcode and go to **Preferences** > **Accounts**
2. Add your Apple ID if it's not already there
3. Select your Apple ID and click **Manage Certificates**
4. Click the + button to create a new Apple Development Certificate if you don't have one

### Running the App on Your iOS Device

1. Open the project in Xcode:
   ```
   cd ios
   open ConnectivityApp.xcworkspace
   ```
2. Select your connected iOS device from the device dropdown in the toolbar
3. Update the bundle identifier if needed (should be unique)
4. In **Signing & Capabilities** tab, select your personal team
5. Click the Play button to build and run the app on your device

## Common USB Debugging Issues and Solutions

### Android Issues

1. **Device Not Detected**
   - Try a different USB cable (some cables are charge-only)
   - Try a different USB port on your computer
   - Restart ADB with:
     ```
     adb kill-server
     adb start-server
     ```
   - Install/update USB drivers for your device:
     - [Google USB Driver](https://developer.android.com/studio/run/win-usb)
     - Or search for "[your device] USB driver"

2. **Installation Failures**
   - Ensure the app is not already installed on the device or uninstall it
   - Check for sufficient storage space on the device
   - Enable "Install via USB" in Developer options

3. **Permission Issues**
   - For Bluetooth and WiFi testing, location permissions must be granted at runtime
   - For Android 10+ (API level 29+), background location permission is needed for Bluetooth scanning
   - For Android 12+ (API level 31+), BLUETOOTH_SCAN and BLUETOOTH_CONNECT permissions are required

### iOS Issues

1. **Trust Issues**
   - When connecting to a Mac for the first time, you might need to "Trust" the computer on your iOS device
   - If prompted, enter your device passcode to continue

2. **Signing Issues**
   - If you get a "Provisioning profile" error, ensure your Apple ID is selected in the Signing & Capabilities tab
   - You may need to create a development certificate and provisioning profile

3. **App Won't Install**
   - Delete any previous versions of the app from your device
   - Restart your iOS device and try again
   - Check that your device is running a compatible iOS version

## Advanced Debugging Techniques

### Viewing Logs in Real-time

#### Android Logs
```
adb logcat -v time | grep "ConnectivityApp"
```

Or use the color-coded logs with the provided script:
```
./adb_logs.sh
```

#### iOS Logs
In Xcode, open the console window (Cmd+Shift+C) while your device is connected and the app is running.

### Testing Bluetooth Functionality

1. Pair your device with another Bluetooth device before testing
2. Use known-working Bluetooth devices for initial testing
3. Test with a variety of Bluetooth device types (headphones, speakers, etc.)

### Testing WiFi Functionality

1. Have multiple WiFi networks available for testing (including 2.4GHz and 5GHz)
2. Set up a test network with a mobile hotspot if needed
3. Test both WPA/WPA2 and WPA3 networks if available

## USB Debugging Scripts

This project includes several scripts to facilitate USB debugging:

- `start_usb_debug.sh` / `start_usb_debug.bat`: Start debugging on a connected USB device
- `build_debug.sh` / `build_debug.bat`: Build with verbose logging for troubleshooting
- `adb_logs.sh` / `adb_logs.bat`: View filtered, color-coded logs from the connected device

## Additional Resources

- [Android Developer: Run Apps on Hardware Device](https://developer.android.com/studio/run/device)
- [Android Developer: Debugging](https://developer.android.com/studio/debug)
- [Apple Developer: Running Your App in the Simulator or on a Device](https://developer.apple.com/documentation/xcode/running-your-app-in-the-simulator-or-on-a-device)
- [ADB Command-Line Reference](https://developer.android.com/studio/command-line/adb)