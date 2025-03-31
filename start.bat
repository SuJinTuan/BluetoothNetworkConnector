@echo off
SETLOCAL EnableDelayedExpansion

:: Colors for console output
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"
set "BLUE=[34m"
set "NC=[0m"

:: Print banner
echo %BLUE%====================================%NC%
echo %BLUE%  ConnectivityApp Starter          %NC%
echo %BLUE%====================================%NC%

:: Check for required tools
echo %YELLOW%Checking environment...%NC%

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Node.js is not installed or not in PATH.%NC%
    echo %YELLOW%Please install Node.js from https://nodejs.org/%NC%
    goto :end
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%npm is not installed or not in PATH.%NC%
    echo %YELLOW%Please install npm, it should come with Node.js.%NC%
    goto :end
)

echo %GREEN%Node.js version: %NC%
node -v
echo %GREEN%npm version: %NC%
npm -v

:: Install dependencies if needed
if not exist "node_modules" (
    echo %YELLOW%Installing dependencies...%NC%
    call npm install
    
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%Failed to install dependencies.%NC%
        goto :end
    )
)

:: Check if Expo is installed
npx expo --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %YELLOW%Expo CLI not found. Installing...%NC%
    call npm install -g expo-cli
)

:: Start the app
echo %YELLOW%Starting the app...%NC%
echo %GREEN%The app will be available at:%NC%
echo %BLUE%• Local: http://localhost:5000%NC%

:: Start with Expo on port 5000
npx expo start --port=5000 --localhost

:end
ENDLOCAL