@echo off
REM ConnectivityApp USB Debugging Script for Windows
REM This script provides a streamlined setup for USB debugging

title ConnectivityApp USB Debugging Setup

echo =================================================
echo     ConnectivityApp USB Debugging Setup Script
echo =================================================

REM Check for adb
where adb >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Android Debug Bridge (adb) is not installed or not in PATH.
    echo Please install Android SDK Platform Tools to use USB debugging.
    echo Visit: https://developer.android.com/studio/releases/platform-tools
    pause
    exit /b
)

REM Check for connected devices
echo Checking for connected Android devices...
adb devices | findstr /r /c:"device$" >nul
if %ERRORLEVEL% NEQ 0 (
    echo No Android devices connected.
    echo Please connect your device via USB and enable USB debugging in Developer options.
    pause
    exit /b
)

echo Found connected device(s):
adb devices

REM Set up port forwarding
echo Setting up port forwarding for Expo...
adb reverse tcp:5000 tcp:5000
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001
adb reverse tcp:19002 tcp:19002

echo Port forwarding configured successfully.

REM Check Node.js and dependencies
echo Checking dependencies...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js to run this application.
    pause
    exit /b
)

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

REM Start the app with localhost for USB debugging
echo =================================================
echo Starting ConnectivityApp in USB debugging mode...
echo When the QR code appears, do ONE of the following:
echo   1. Scan the QR code with the Expo Go app on a different device
echo   2. On your connected device, open Expo Go and enter: exp://localhost:5000
echo =================================================

REM Start the development server
npx expo start --port=5000 --localhost

pause