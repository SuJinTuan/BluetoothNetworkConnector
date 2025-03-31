# APK Build Instructions

This document provides detailed instructions for building an Android APK from this project. These instructions are designed to be beginner-friendly while also offering solutions for common build issues.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Java Development Kit (JDK)](https://adoptium.net/) (version 11 or 17 recommended)
- [Android Studio](https://developer.android.com/studio) with Android SDK
- [Git](https://git-scm.com/downloads) (for version control)

## Environment Setup

1. **Android SDK Setup**:
   - Launch Android Studio
   - Go to Settings/Preferences > Appearance & Behavior > System Settings > Android SDK
   - In the SDK Platforms tab, install Android 13 (API Level 33) or later
   - In the SDK Tools tab, install:
     - Android SDK Build-Tools
     - Android SDK Command-line Tools
     - Android Emulator
     - Android SDK Platform-Tools

2. **Environment Variables**:
   - Set ANDROID_HOME to point to your Android SDK location
   - Add platform-tools and tools to your PATH

## Standard Build Process

### Using the Provided Build Scripts

This project includes convenient build scripts that automate the APK generation process:

#### On Windows:
```
.\build_apk.bat
```

#### On macOS/Linux:
```
./build_apk.sh
```

The generated APK will be available in the `build` directory.

### Manual Build Process

If you prefer to build manually:

1. Install project dependencies:
   ```
   npm install
   ```

2. Navigate to the Android directory:
   ```
   cd android
   ```

3. Clean any previous builds:
   ```
   ./gradlew clean
   ```

4. Build the debug APK:
   ```
   ./gradlew assembleDebug
   ```

5. The generated APK will be located at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Troubleshooting Common Issues

### Build Failures

1. **Dependencies Issues**:
   - Try running `npm install` again
   - Delete `node_modules` and run `npm install` with the `--force` option

2. **Gradle Issues**:
   - Use the `build_debug.sh` or `build_debug.bat` script for more verbose output
   - Update Gradle in `android/gradle/wrapper/gradle-wrapper.properties`

3. **SDK Version Conflicts**:
   - Check that your installed SDK versions match those in `android/build.gradle`
   - Update `compileSdkVersion`, `minSdkVersion`, and `targetSdkVersion` as needed

4. **Memory Issues**:
   - Increase Gradle memory by adding the following to `android/gradle.properties`:
     ```
     org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=4096m -XX:+HeapDumpOnOutOfMemoryError
     ```

5. **Multidex Issues**:
   - The project is already configured for multidex support
   - If needed, verify the multidex configuration in `android/app/build.gradle`

### Offline Build

If you're experiencing internet connectivity issues during build:

1. Use the offline build scripts:
   ```
   ./build_offline.sh   # For macOS/Linux
   build_offline.bat    # For Windows
   ```

2. See `OFFLINE_BUILD_GUIDE.md` for more details on offline building.

## Installing the APK

### On an Emulator

1. Start your Android emulator from Android Studio
2. Install via command line:
   ```
   adb install ./build/app-debug.apk
   ```

### On a Physical Device

1. Enable USB debugging on your device:
   - Go to Settings > About phone > Tap "Build number" 7 times
   - Go back to Settings > System > Advanced > Developer options
   - Enable USB debugging

2. Connect your device to your computer via USB

3. Install the APK:
   ```
   adb install ./build/app-debug.apk
   ```

## Building for Release

To create a release (signed) version:

1. Create a signing key (if you don't have one):
   ```
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Place the keystore file in `android/app`

3. Configure signing in `android/app/build.gradle`:
   ```gradle
   signingConfigs {
       release {
           storeFile file('my-release-key.keystore')
           storePassword 'your-store-password'
           keyAlias 'my-key-alias'
           keyPassword 'your-key-password'
       }
   }
   ```

4. Build the release APK:
   ```
   cd android
   ./gradlew assembleRelease
   ```

5. The signed APK will be at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

## Additional Resources

- See `USB_DEBUGGING.md` for detailed information on USB debugging
- See `OFFLINE_BUILD_GUIDE.md` for offline building instructions
- See `build_debug.sh` or `build_debug.bat` for detailed build debugging