#!/bin/bash

# Define color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}  ConnectivityApp USB Debug Tool    ${NC}"
echo -e "${BLUE}====================================${NC}"

# Check if ADB is installed
if ! command -v adb &> /dev/null; then
    echo -e "${RED}ADB is not installed or not in PATH.${NC}"
    echo -e "${YELLOW}Please install Android SDK Platform Tools.${NC}"
    exit 1
fi

# Start ADB server if not running
echo -e "${YELLOW}Starting ADB server...${NC}"
adb start-server

# Check for connected devices
echo -e "${YELLOW}Checking for connected devices...${NC}"
DEVICES=$(adb devices | grep -v "List" | grep "device$")

if [ -z "$DEVICES" ]; then
    echo -e "${RED}No devices connected!${NC}"
    echo -e "${YELLOW}Please connect an Android device with USB debugging enabled.${NC}"
    exit 1
fi

# Show connected devices
echo -e "${GREEN}Found the following devices:${NC}"
adb devices | grep -v "List"

# Build the debug APK
echo -e "${YELLOW}Building debug APK...${NC}"
# Navigate to root of the project
cd "$(dirname "$0")"

# Check if APK already exists
APK_PATH="./android/app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK_PATH" ]; then
    echo -e "${YELLOW}Debug APK not found. Building now...${NC}"
    
    # Build debug APK
    cd android
    ./gradlew assembleDebug
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Build failed!${NC}"
        exit 1
    fi
    
    cd ..
    echo -e "${GREEN}Build successful!${NC}"
else
    echo -e "${GREEN}Using existing debug APK.${NC}"
fi

# Install the app on all connected devices
echo -e "${YELLOW}Installing app on connected devices...${NC}"
for DEVICE in $(adb devices | grep -v "List" | cut -f 1); do
    if [ ! -z "$DEVICE" ]; then
        echo -e "${YELLOW}Installing on device: $DEVICE${NC}"
        adb -s $DEVICE install -r $APK_PATH
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Installation successful on $DEVICE${NC}"
            
            # Start the app
            echo -e "${YELLOW}Starting app on $DEVICE...${NC}"
            adb -s $DEVICE shell am start -n com.connectivityapp/.MainActivity
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}App started successfully on $DEVICE${NC}"
            else
                echo -e "${RED}Failed to start app on $DEVICE${NC}"
            fi
        else
            echo -e "${RED}Installation failed on $DEVICE${NC}"
        fi
    fi
done

# Show logs
echo -e "${YELLOW}Showing logs from the app:${NC}"
echo -e "${BLUE}(Press Ctrl+C to stop logging)${NC}"
echo -e "${YELLOW}=============== LOG OUTPUT ===============${NC}"
adb logcat -v time | grep -E "ConnectivityApp|Bluetooth|WiFi|ReactNative|System.err|Exception|Error"