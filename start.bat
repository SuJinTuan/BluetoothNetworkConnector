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

REM Start the development server
npx expo start --port=5000 --lan

pause