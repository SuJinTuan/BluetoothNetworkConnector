@echo off
REM ConnectivityApp Local APK Build Script for Windows
REM This script builds an APK file locally using the React Native CLI

title ConnectivityApp APK Builder

echo =================================================
echo       ConnectivityApp Local APK Build Script
echo =================================================

REM Check if Java is installed (required for Android builds)
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Java is not installed. Java JDK is required for Android builds.
    echo Please install Java JDK 11 or newer and try again.
    pause
    exit /b
)

REM Check if Android SDK is installed
if "%ANDROID_HOME%"=="" (
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
    ) else if exist "%USERPROFILE%\AppData\Local\Android\Sdk" (
        set ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk
    ) else (
        echo Android SDK not found. Please install Android Studio and Android SDK.
        echo Then set the ANDROID_HOME environment variable.
        pause
        exit /b
    )
)

echo Using Android SDK at: %ANDROID_HOME%

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js to build this application.
    pause
    exit /b
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

REM Ensure the android directory exists
if not exist "android\" (
    echo Android directory not found. Running eject to create native projects...
    call npx expo prebuild --platform android
)

REM Navigate to the android directory
cd android

REM Check if gradlew exists
if not exist "gradlew.bat" (
    echo Gradle wrapper not found. Cannot build APK.
    cd ..
    pause
    exit /b
)

echo Building debug APK...
echo This may take several minutes. Please be patient.

REM Clean and build the APK
call gradlew.bat clean

REM Build the APK
call gradlew.bat assembleDebug

REM Check if the build was successful
if %ERRORLEVEL% EQU 0 (
    set APK_PATH=app\build\outputs\apk\debug\app-debug.apk
    
    REM Check if the APK exists
    if exist "%APK_PATH%" (
        REM Create an outputs directory in the project root
        cd ..
        if not exist "outputs\" mkdir outputs
        
        REM Copy the APK to the outputs directory
        copy "android\%APK_PATH%" "outputs\ConnectivityApp-debug.apk" >nul
        
        echo APK built successfully!
        echo APK location: %CD%\outputs\ConnectivityApp-debug.apk
        
        REM Display instructions for installing
        echo To install on a device, connect via USB and run:
        echo adb install outputs\ConnectivityApp-debug.apk
    ) else (
        echo APK file not found at expected location: android\%APK_PATH%
        cd ..
        pause
        exit /b
    )
) else (
    echo APK build failed. See errors above.
    cd ..
    pause
    exit /b
)

cd ..
pause