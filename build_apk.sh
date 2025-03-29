#!/bin/bash
# ConnectivityApp Local APK Build Script
# This script builds an APK file locally using the React Native CLI

# Define colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}      ConnectivityApp Local APK Build Script      ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if Java is installed (required for Android builds)
if ! command -v java &> /dev/null; then
    echo -e "${RED}Java is not installed. Java JDK is required for Android builds.${NC}"
    echo -e "${YELLOW}Please install Java JDK 11 or newer and try again.${NC}"
    exit 1
fi

# Check if Android SDK is installed
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    elif [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    else
        echo -e "${RED}Android SDK not found. Please install Android Studio and Android SDK.${NC}"
        echo -e "${YELLOW}Then set the ANDROID_HOME environment variable.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Using Android SDK at: ${ANDROID_HOME}${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js to build this application.${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Ensure the android directory exists
if [ ! -d "android" ]; then
    echo -e "${RED}Android directory not found. Running eject to create native projects...${NC}"
    npx expo prebuild --platform android
fi

# Navigate to the android directory
cd android

# Check if gradlew exists
if [ ! -f "gradlew" ]; then
    echo -e "${RED}Gradle wrapper not found. Cannot build APK.${NC}"
    exit 1
fi

# Make gradlew executable
chmod +x gradlew

echo -e "${YELLOW}Building debug APK...${NC}"
echo -e "${BLUE}This may take several minutes. Please be patient.${NC}"

# Clean and build the APK
./gradlew clean

# Build the APK
./gradlew assembleDebug

# Check if the build was successful
if [ $? -eq 0 ]; then
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    
    # Check if the APK exists
    if [ -f "$APK_PATH" ]; then
        # Create an outputs directory in the project root
        cd ..
        mkdir -p outputs
        
        # Copy the APK to the outputs directory
        cp android/$APK_PATH outputs/ConnectivityApp-debug.apk
        
        echo -e "${GREEN}APK built successfully!${NC}"
        echo -e "${GREEN}APK location: ${PWD}/outputs/ConnectivityApp-debug.apk${NC}"
        
        # Check file size
        APK_SIZE=$(du -h outputs/ConnectivityApp-debug.apk | awk '{print $1}')
        echo -e "${BLUE}APK size: ${APK_SIZE}${NC}"
        
        echo -e "${YELLOW}To install on a device, connect via USB and run:${NC}"
        echo -e "adb install outputs/ConnectivityApp-debug.apk"
    else
        echo -e "${RED}APK file not found at expected location: android/$APK_PATH${NC}"
        exit 1
    fi
else
    echo -e "${RED}APK build failed. See errors above.${NC}"
    exit 1
fi