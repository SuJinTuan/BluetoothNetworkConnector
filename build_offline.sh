#!/bin/bash
# ConnectivityApp Offline Build Script
# This script handles building with potentially slow or unreliable network connections

# Define colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}      ConnectivityApp Offline Build Script       ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check for Java JDK
if ! command -v javac &> /dev/null; then
    echo -e "${RED}Java JDK is not installed or not in PATH.${NC}"
    echo -e "${YELLOW}Please install Java Development Kit 11 or newer.${NC}"
    exit 1
fi

echo -e "${GREEN}Java JDK found:${NC}"
javac -version

# Create gradle.properties with offline settings if needed
GRADLE_PROPERTIES="android/gradle.properties"
if [ -f "$GRADLE_PROPERTIES" ]; then
    # Check if offline mode is already configured
    if ! grep -q "org.gradle.offline=true" "$GRADLE_PROPERTIES"; then
        echo -e "${YELLOW}Adding offline build settings to gradle.properties...${NC}"
        cat >> "$GRADLE_PROPERTIES" << EOL

# Added for improved offline/slow network building
org.gradle.offline=true
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.jvmargs=-Xmx4608m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError
android.enableJetifier=true
EOL
    fi
else
    echo -e "${RED}Cannot find gradle.properties at $GRADLE_PROPERTIES${NC}"
    echo -e "${YELLOW}Please make sure the Android project is properly set up.${NC}"
    exit 1
fi

# Pre-download Gradle if needed
GRADLE_ZIP="gradle-8.0-all.zip"
GRADLE_DIR="$HOME/.gradle/wrapper/dists/gradle-8.0-all"

if [ ! -d "$GRADLE_DIR" ]; then
    echo -e "${YELLOW}Gradle distribution not found locally. Attempting to download...${NC}"
    
    # Create directories if they don't exist
    mkdir -p "$HOME/.gradle/wrapper/dists/gradle-8.0-all"
    
    # Try to download with increased timeout
    echo -e "${YELLOW}Downloading Gradle with increased timeout (120s)...${NC}"
    curl -L -o /tmp/$GRADLE_ZIP https://mirrors.cloud.tencent.com/gradle/gradle-8.0-all.zip --connect-timeout 10 --max-time 120
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Gradle downloaded successfully.${NC}"
        
        # Determine hash directory name (this matches Gradle's approach)
        HASH_DIR=$(mkdir -p /tmp/gradle_hash && cd /tmp/gradle_hash && unzip -q /tmp/$GRADLE_ZIP 'gradle-8.0/bin/gradle' && cd gradle-8.0/bin && echo gradle | md5sum | cut -d ' ' -f 1 && cd ../../.. && rm -rf /tmp/gradle_hash)
        
        # Create the hash directory and unzip
        mkdir -p "$GRADLE_DIR/$HASH_DIR"
        unzip -q /tmp/$GRADLE_ZIP -d "$GRADLE_DIR/$HASH_DIR"
        touch "$GRADLE_DIR/$HASH_DIR/gradle-8.0-all.zip.ok"
        
        echo -e "${GREEN}Gradle installed to local cache.${NC}"
    else
        echo -e "${RED}Failed to download Gradle.${NC}"
        echo -e "${YELLOW}Will attempt to continue in offline mode, but build may fail.${NC}"
    fi
else
    echo -e "${GREEN}Gradle is already cached locally.${NC}"
fi

# Set up Node.js
echo -e "${YELLOW}Checking Node.js environment...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js to run this application.${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Now build the APK with offline mode
echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Building APK in offline mode with extended timeouts...${NC}"
echo -e "${YELLOW}This may take some time. Please be patient...${NC}"
echo -e "${BLUE}==================================================${NC}"

# Run the build command with modified settings
cd android
./gradlew assembleRelease --offline --stacktrace --no-daemon --info

# Check if build successful
if [ $? -eq 0 ]; then
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        echo -e "${GREEN}Build successful! APK created at: ${YELLOW}$APK_PATH${NC}"
        echo -e "${YELLOW}You can install this APK directly on your Android device.${NC}"
    else
        echo -e "${RED}Build process completed but APK not found at expected location.${NC}"
    fi
else
    echo -e "${RED}Build failed. See above for error details.${NC}"
fi

cd ..
echo -e "${BLUE}==================================================${NC}"