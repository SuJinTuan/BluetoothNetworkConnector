@echo off
REM ConnectivityApp Start Script for Windows
REM This script provides a one-click startup solution for the ConnectivityApp

title ConnectivityApp Startup

echo =================================================
echo           ConnectivityApp Startup Script
echo =================================================

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js to run this application.
    pause
    exit /b
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install npm to run this application.
    pause
    exit /b
)

REM Check if Expo CLI is installed
where expo >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Expo CLI is not installed. Installing it now...
    call npm install -g expo-cli
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

REM Enable delayed expansion for variables
setlocal EnableDelayedExpansion

REM Get the IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r /c:"IPv4 Address"') do (
    set LOCAL_IP=%%a
    set LOCAL_IP=!LOCAL_IP:~1!
    goto :break
)
:break

if "%LOCAL_IP%"=="" (
    set LOCAL_IP=localhost
)

echo Starting ConnectivityApp on %LOCAL_IP%:5000...
echo You can access the app by:
echo   1. Scanning the QR code with Expo Go app (Android) or Camera app (iOS)
echo   2. Entering the URL in Expo Go: exp://%LOCAL_IP%:5000
echo =================================================

REM Ask user for connection method
echo Choose your connection method:
echo 1. WiFi connection (LAN)
echo 2. USB connection (localhost)
set /p connection_choice="Enter choice (1 or 2): "

if "%connection_choice%"=="1" (
    echo Starting with LAN connection for wireless debugging...
    npx expo start --port=5000 --lan
) else if "%connection_choice%"=="2" (
    echo Starting with localhost connection for USB debugging...
    echo Please make sure your device is connected via USB and ADB is configured.
    echo Run the following commands in a separate terminal if not already done:
    echo adb reverse tcp:5000 tcp:5000
    echo adb reverse tcp:19000 tcp:19000
    echo adb reverse tcp:19001 tcp:19001
    npx expo start --port=5000 --localhost
) else (
    echo Invalid choice. Defaulting to LAN connection...
    npx expo start --port=5000 --lan
)

pause