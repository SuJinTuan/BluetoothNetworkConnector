#!/bin/bash
# ConnectivityApp Start Script
# This script provides a one-click startup solution for the ConnectivityApp

# Define colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}        ConnectivityApp Startup Script            ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js to run this application.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm is not installed. Please install npm to run this application.${NC}"
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

# Check local IP address for better LAN connectivity
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

echo -e "${GREEN}Starting ConnectivityApp on $LOCAL_IP:5000...${NC}"
echo -e "${YELLOW}You can access the app by:${NC}"
echo -e "  1. Scanning the QR code with Expo Go app (Android) or Camera app (iOS)"
echo -e "  2. Entering the URL in Expo Go: exp://$LOCAL_IP:5000"
echo -e "${BLUE}==================================================${NC}"

# Ask user for connection method
echo -e "${YELLOW}Choose your connection method:${NC}"
echo -e "1. WiFi connection (LAN)"
echo -e "2. USB connection (localhost)"
read -p "Enter choice (1 or 2): " connection_choice

if [ "$connection_choice" == "1" ]; then
    echo -e "${GREEN}Starting with LAN connection for wireless debugging...${NC}"
    npx expo start --port=5000 --lan
elif [ "$connection_choice" == "2" ]; then
    echo -e "${GREEN}Starting with localhost connection for USB debugging...${NC}"
    echo -e "${YELLOW}Please make sure your device is connected via USB and ADB is configured.${NC}"
    echo -e "${BLUE}Run the following commands in a separate terminal if not already done:${NC}"
    echo -e "  adb reverse tcp:5000 tcp:5000"
    echo -e "  adb reverse tcp:19000 tcp:19000"
    echo -e "  adb reverse tcp:19001 tcp:19001"
    npx expo start --port=5000 --localhost
else
    echo -e "${YELLOW}Invalid choice. Defaulting to LAN connection...${NC}"
    npx expo start --port=5000 --lan
fi