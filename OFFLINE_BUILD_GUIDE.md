# Offline Build Guide

This guide provides detailed instructions for building the ConnectivityApp without requiring internet connectivity during the build process. This is useful in environments with limited, unstable, or restricted internet access.

## Why Build Offline?

Building a React Native app typically requires downloading dependencies from npm, Maven, and other repositories. This can be problematic in:

1. Environments with firewall restrictions
2. Areas with poor or intermittent internet connectivity
3. Air-gapped systems for security purposes
4. Situations where you need guaranteed build reproducibility

## Prerequisites

Before attempting an offline build, ensure you have the following:

1. **Completed an online build at least once** on the same machine to cache dependencies
2. All necessary SDKs and tools installed:
   - Node.js and npm
   - Java Development Kit (JDK)
   - Android SDK
   - Gradle

## Offline Build Process

### Using the Provided Offline Build Scripts

This project includes ready-to-use scripts for offline building:

**For Windows:**
```
build_offline.bat
```

**For macOS/Linux:**
```
./build_offline.sh
```

These scripts automate the offline build process by:
1. Setting Gradle to offline mode
2. Using cached npm dependencies
3. Disabling analytics and telemetry
4. Bypassing update checks

### Manual Offline Building

If you prefer to perform an offline build manually, follow these steps:

#### Step 1: Prepare Node.js Dependencies

Ensure all npm dependencies are cached locally:

```
# First do this online to cache dependencies
npm install

# Then for offline builds, use
npm install --offline
```

#### Step 2: Configure Gradle for Offline Mode

Create or modify `~/.gradle/gradle.properties` to include:

```
org.gradle.offline=true
```

Or run Gradle with the offline flag:

```
./gradlew --offline assembleDebug
```

#### Step 3: Disable Analytics and Telemetry

Add these settings to your environment:

```
# For Node.js
export NEXT_TELEMETRY_DISABLED=1
export ASTRO_TELEMETRY_DISABLED=1
export GATSBY_TELEMETRY_DISABLED=1
export NETLIFY_TELEMETRY_DISABLED=1

# For Gradle
export GRADLE_OPTS="-Dgradle.wrapper.offline.allowed=true"
```

## Troubleshooting Offline Builds

### Common Issues and Solutions

1. **Missing Dependencies**
   
   If you see errors about missing dependencies:
   
   ```
   Could not resolve com.android.tools.build:gradle:4.2.2
   ```
   
   **Solution**: You need to build online at least once to cache this dependency. Alternatively, manually download the JAR/AAR file and place it in the Gradle cache directory.

2. **Gradle Wrapper Issues**
   
   If Gradle wrapper attempts to download a new version:
   
   **Solution**: Set the environment variable:
   ```
   export GRADLE_OFFLINE=true
   ```
   
   And add to your `gradle.properties`:
   ```
   org.gradle.wrapper.offline.allowed=true
   ```

3. **React Native Packager Issues**
   
   If Metro bundler tries to connect online:
   
   **Solution**: Run Metro with the `--max-workers 1` option and ensure all dependencies are already installed.

4. **Native Module Linking Problems**
   
   Some native modules might fail to link when offline.
   
   **Solution**: Pre-link all native modules while online:
   ```
   npx react-native link
   ```

## Creating a Fully Offline Development Environment

For teams working in restricted environments, consider creating a local npm registry mirror and Maven repository:

### Local npm Registry

Use Verdaccio to create a local npm registry:

```
npm install -g verdaccio
verdaccio
```

Configure npm to use your local registry:

```
npm set registry http://localhost:4873/
```

### Local Maven Repository

Set up a local Maven repository using Nexus or Artifactory:

1. Download and install Nexus Repository OSS
2. Configure Gradle to use your local Maven repository:

   In your project's `build.gradle`:
   ```groovy
   repositories {
       maven { url "http://localhost:8081/repository/maven-public/" }
   }
   ```

## Appendix: Understanding Dependency Caching

### npm Cache Locations

- **Windows**: `%AppData%/npm-cache`
- **macOS/Linux**: `~/.npm`

### Gradle Cache Locations

- **Windows**: `%USERPROFILE%/.gradle/caches`
- **macOS/Linux**: `~/.gradle/caches`

### Maven Cache Location

- **Windows**: `%USERPROFILE%/.m2/repository`
- **macOS/Linux**: `~/.m2/repository`

## Creating a Portable Build Environment

For teams needing to transport a build environment to offline locations:

1. Create a full build on an online machine
2. Archive the following directories:
   - `node_modules/`
   - `.gradle/`
   - `~/.gradle/caches/`
   - `~/.npm/`
   - `android/.gradle/`
   
3. Transfer these archives to the offline machine
4. Extract them to their respective locations
5. Use the offline build scripts provided

## Additional Resources

- [Gradle Offline Mode Documentation](https://docs.gradle.org/current/userguide/dependency_management.html#sec:offline-mode)
- [npm Offline Documentation](https://docs.npmjs.com/cli/v8/commands/npm-cache)
- See the `build_offline.sh` or `build_offline.bat` scripts in this project for implementation details