#!/bin/bash
# ConnectivityApp USB Debugging Script
# This script provides a streamlined setup for USB debugging

# Define colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}    ConnectivityApp USB Debugging Setup Script    ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check for adb
if ! command -v adb &> /dev/null; then
    echo -e "${RED}Android Debug Bridge (adb) is not installed or not in PATH.${NC}"
    echo -e "${YELLOW}Please install Android SDK Platform Tools to use USB debugging.${NC}"
    echo -e "Visit: https://developer.android.com/studio/releases/platform-tools"
    exit 1
fi

# Check for connected devices
echo -e "${YELLOW}Checking for connected Android devices...${NC}"
DEVICES=$(adb devices | grep -v "List" | grep -v "^$" | wc -l)

if [ "$DEVICES" -eq 0 ]; then
    echo -e "${RED}No Android devices connected.${NC}"
    echo -e "${YELLOW}Please connect your device via USB and enable USB debugging in Developer options.${NC}"
    exit 1
fi

echo -e "${GREEN}Found $DEVICES connected device(s).${NC}"
adb devices | grep -v "List" | grep -v "^$"

# Set up port forwarding
echo -e "${YELLOW}Setting up port forwarding for Expo...${NC}"
adb reverse tcp:5000 tcp:5000
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001
adb reverse tcp:19002 tcp:19002

echo -e "${GREEN}Port forwarding configured successfully.${NC}"

# Check Node.js and dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js to run this application.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm to run this application.${NC}"
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo -e "${YELLOW}Expo CLI is not installed. Installing it now...${NC}"
    npm install -g expo-cli
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Start the app with localhost for USB debugging
echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Starting ConnectivityApp in USB debugging mode...${NC}"
echo -e "${YELLOW}When the QR code appears, do ONE of the following:${NC}"
echo -e "  1. Scan the QR code with the Expo Go app on a different device"
echo -e "  2. On your connected device, open Expo Go and enter: ${BLUE}exp://localhost:5000${NC}"
echo -e "${BLUE}==================================================${NC}"

# Start the development server
npx expo start --port=5000 --localhost