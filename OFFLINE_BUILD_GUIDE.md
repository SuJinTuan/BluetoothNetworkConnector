# Offline and Slow Connection Build Guide

This guide provides instructions for building the ConnectivityApp in environments with slow, unreliable, or no internet connections.

## Overview

Building React Native applications requires downloading many dependencies, which can be challenging in environments with limited connectivity. This guide outlines strategies to overcome these challenges using:

1. Pre-cached dependencies
2. Alternative repositories
3. Modified build configurations
4. Offline build scripts

## Prerequisites

- Basic familiarity with command-line tools
- Android development environment (for APK builds)
- Node.js and npm installed

## Using the Offline Build Scripts

We provide dedicated scripts for building in offline/slow connection environments:

### For Linux/macOS:
```bash
# Make sure the script is executable
chmod +x build_offline.sh

# Run the offline build script
./build_offline.sh
```

### For Windows:
```cmd
# Run the offline build script
build_offline.bat
```

## What the Offline Scripts Do

1. **Verify Development Environment**: Check for required tools like Java JDK
2. **Configure Gradle for Offline Mode**: Modify gradle.properties for offline builds
3. **Pre-download Gradle**: Download and cache Gradle distribution if needed
4. **Install Node Dependencies**: If not already installed
5. **Build with Optimized Settings**: Run the build with offline flags and extended timeouts

## Manual Offline Build Configuration

If you prefer to manually configure offline builds:

### 1. Configure Gradle Properties

Add these lines to `android/gradle.properties`:

```properties
# Offline build settings
org.gradle.offline=true
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.jvmargs=-Xmx4608m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError
android.enableJetifier=true
```

### 2. Pre-download Gradle Distribution

Download the Gradle distribution manually from:
https://mirrors.cloud.tencent.com/gradle/gradle-8.0-all.zip

Place it in:
- Windows: %USERPROFILE%\.gradle\wrapper\dists\gradle-8.0-all\
- Linux/macOS: ~/.gradle/wrapper/dists/gradle-8.0-all/

### 3. Run Offline Build Command

```bash
cd android
./gradlew assembleRelease --offline --stacktrace --no-daemon --info
```

## Troubleshooting

### Common Issues and Solutions

#### "Could not resolve all dependencies"
- Run a build with internet connection to cache dependencies first
- Verify you have the correct repositories configured

#### "Unable to download Gradle distribution"
- Manually download and place Gradle ZIP as described above
- Use a more reliable internet connection for the initial download

#### "Build timeouts"
- Increase the Gradle timeout in gradle-wrapper.properties
- Use a VPN to access more reliable download sources

#### "Connection reset" errors
- Try alternative repositories as configured in build.gradle
- Use a proxy server if available

## Pre-caching Dependencies

Before going offline, run these commands to cache dependencies:

```bash
# Cache npm dependencies
npm ci

# Cache Gradle dependencies
cd android
./gradlew --refresh-dependencies
```

## Additional Resources

- [Gradle Offline Mode Documentation](https://docs.gradle.org/current/userguide/dependency_management.html#sec:offline-mode)
- [React Native Building from Source](https://reactnative.dev/docs/building-from-source)
- [Expo Offline Development](https://docs.expo.dev/workflow/offline/)