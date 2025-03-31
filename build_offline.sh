#!/bin/bash

# Define color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}  ConnectivityApp Offline Builder   ${NC}"
echo -e "${BLUE}====================================${NC}"

# Navigate to project root
cd "$(dirname "$0")"

# Disable telemetry and analytics
echo -e "${YELLOW}Disabling telemetry and analytics...${NC}"
export EXPO_NO_TELEMETRY=1
export NEXT_TELEMETRY_DISABLED=1
export ASTRO_TELEMETRY_DISABLED=1
export GATSBY_TELEMETRY_DISABLED=1
export NETLIFY_TELEMETRY_DISABLED=1
export REACT_NATIVE_TELEMETRY_ENABLED=0

# Set Gradle to offline mode
export GRADLE_OPTS="-Dorg.gradle.offline=true -Dgradle.wrapper.offline.allowed=true"

# Check for cached dependencies
echo -e "${YELLOW}Checking for cached npm dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${RED}Error: node_modules directory not found.${NC}"
    echo -e "${YELLOW}You need to run 'npm install' while online at least once before using offline build.${NC}"
    exit 1
fi

# Install dependencies in offline mode
echo -e "${YELLOW}Installing dependencies in offline mode...${NC}"
npm install --prefer-offline --no-audit --no-fund --loglevel=error || {
    echo -e "${RED}Error: Failed to install dependencies in offline mode.${NC}"
    exit 1
}

# Set up environment for Android build
echo -e "${YELLOW}Setting up environment for Android build...${NC}"
export ANDROID_HOME=${ANDROID_HOME:-"$HOME/Android/Sdk"}
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Create temporary gradle.properties with offline settings
echo -e "${YELLOW}Configuring Gradle for offline build...${NC}"
GRADLE_PROPS_PATH="android/gradle.properties"
if [ -f "$GRADLE_PROPS_PATH" ]; then
    # Backup original gradle.properties
    cp "$GRADLE_PROPS_PATH" "$GRADLE_PROPS_PATH.bak"
    
    # Add offline settings
    echo "" >> "$GRADLE_PROPS_PATH"
    echo "# Offline build settings" >> "$GRADLE_PROPS_PATH"
    echo "org.gradle.offline=true" >> "$GRADLE_PROPS_PATH"
    echo "org.gradle.wrapper.offline.allowed=true" >> "$GRADLE_PROPS_PATH"
else
    echo -e "${RED}Warning: gradle.properties not found at $GRADLE_PROPS_PATH${NC}"
fi

# Build debug APK in offline mode
echo -e "${YELLOW}Building debug APK in offline mode...${NC}"
cd android

# Clean might not work in offline mode, so skip it
echo -e "${YELLOW}Skipping clean task in offline mode...${NC}"

# Build the APK with offline flag
./gradlew --offline assembleDebug || {
    echo -e "${RED}Error: Failed to build APK in offline mode.${NC}"
    
    # Restore gradle.properties if it was modified
    if [ -f "../$GRADLE_PROPS_PATH.bak" ]; then
        mv "../$GRADLE_PROPS_PATH.bak" "../$GRADLE_PROPS_PATH"
    fi
    
    cd ..
    exit 1
}

# Return to project root
cd ..

# Restore original gradle.properties
if [ -f "$GRADLE_PROPS_PATH.bak" ]; then
    mv "$GRADLE_PROPS_PATH.bak" "$GRADLE_PROPS_PATH"
fi

# Check if build was successful
APK_PATH="./android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo -e "${GREEN}✅ Offline build successful!${NC}"
    echo -e "${GREEN}📱 APK location: $APK_PATH${NC}"
    
    # Copy to build directory for easier access
    mkdir -p build
    cp "$APK_PATH" build/
    echo -e "${GREEN}📦 APK copied to build directory for easier access${NC}"
else
    echo -e "${RED}❌ Build failed: APK not found at expected location${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Offline build process complete!${NC}"