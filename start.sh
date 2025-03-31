#!/bin/bash

# Define color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}  ConnectivityApp Starter          ${NC}"
echo -e "${BLUE}====================================${NC}"

# Navigate to project root
cd "$(dirname "$0")"

# Check for required tools
echo -e "${YELLOW}Checking environment...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed or not in PATH.${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed or not in PATH.${NC}"
    echo -e "${YELLOW}Please install npm, it should come with Node.js.${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js version: $(node -v)${NC}"
echo -e "${GREEN}npm version: $(npm -v)${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies.${NC}"
        exit 1
    fi
fi

# Check if Expo is installed
if ! npx expo --version &> /dev/null; then
    echo -e "${YELLOW}Expo CLI not found. Installing...${NC}"
    npm install -g expo-cli
fi

# Start the app
echo -e "${YELLOW}Starting the app...${NC}"
echo -e "${GREEN}The app will be available at:${NC}"
echo -e "${BLUE}• Local: http://localhost:5000${NC}"

# Start with Expo on port 5000
npx expo start --port=5000 --localhost