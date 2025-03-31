@echo off
REM ConnectivityApp Offline Build Script for Windows
REM This script handles building with potentially slow or unreliable network connections

title ConnectivityApp Offline Build

echo =================================================
echo      ConnectivityApp Offline Build Script
echo =================================================

REM Check for Java JDK
javac -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Java JDK is not installed or not in PATH.
    echo Please install Java Development Kit 11 or newer.
    pause
    exit /b
)

echo Java JDK found:
javac -version

REM Create gradle.properties with offline settings if needed
set GRADLE_PROPERTIES=android\gradle.properties
if exist "%GRADLE_PROPERTIES%" (
    findstr /C:"org.gradle.offline=true" "%GRADLE_PROPERTIES%" >nul
    if %ERRORLEVEL% NEQ 0 (
        echo Adding offline build settings to gradle.properties...
        echo. >> "%GRADLE_PROPERTIES%"
        echo # Added for improved offline/slow network building >> "%GRADLE_PROPERTIES%"
        echo org.gradle.offline=true >> "%GRADLE_PROPERTIES%"
        echo org.gradle.daemon=true >> "%GRADLE_PROPERTIES%"
        echo org.gradle.parallel=true >> "%GRADLE_PROPERTIES%"
        echo org.gradle.configureondemand=true >> "%GRADLE_PROPERTIES%"
        echo org.gradle.jvmargs=-Xmx4608m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError >> "%GRADLE_PROPERTIES%"
        echo android.enableJetifier=true >> "%GRADLE_PROPERTIES%"
    )
) else (
    echo Cannot find gradle.properties at %GRADLE_PROPERTIES%
    echo Please make sure the Android project is properly set up.
    pause
    exit /b
)

REM Pre-download Gradle if needed
set GRADLE_ZIP=gradle-8.0-all.zip
set GRADLE_DOWNLOAD_URL=https://mirrors.cloud.tencent.com/gradle/gradle-8.0-all.zip
set GRADLE_DIR=%USERPROFILE%\.gradle\wrapper\dists\gradle-8.0-all

if not exist "%GRADLE_DIR%" (
    echo Gradle distribution not found locally. Attempting to download...
    
    REM Create directories if they don't exist
    mkdir "%USERPROFILE%\.gradle\wrapper\dists\gradle-8.0-all" 2>nul
    
    REM Try to download with increased timeout
    echo Downloading Gradle with increased timeout...
    powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%GRADLE_DOWNLOAD_URL%', '%TEMP%\%GRADLE_ZIP%')"
    
    if %ERRORLEVEL% EQU 0 (
        echo Gradle downloaded successfully.
        
        REM Create a temporary directory to extract a single file for hash calculation
        mkdir "%TEMP%\gradle_hash" 2>nul
        powershell -Command "Expand-Archive -Path '%TEMP%\%GRADLE_ZIP%' -DestinationPath '%TEMP%\gradle_hash' -Force"
        
        REM Calculate a simple hash from the gradle.bat file
        REM This is a simplified approach compared to Gradle's actual hash algorithm
        for /f "tokens=*" %%a in ('powershell -Command "Get-FileHash -Algorithm MD5 '%TEMP%\gradle_hash\gradle-8.0\bin\gradle.bat' | Select-Object -ExpandProperty Hash"') do set HASH_DIR=%%a
        
        REM Create the hash directory and unzip
        mkdir "%GRADLE_DIR%\%HASH_DIR%" 2>nul
        powershell -Command "Expand-Archive -Path '%TEMP%\%GRADLE_ZIP%' -DestinationPath '%GRADLE_DIR%\%HASH_DIR%' -Force"
        echo. > "%GRADLE_DIR%\%HASH_DIR%\gradle-8.0-all.zip.ok"
        
        echo Gradle installed to local cache.
        rd /s /q "%TEMP%\gradle_hash" 2>nul
    ) else (
        echo Failed to download Gradle.
        echo Will attempt to continue in offline mode, but build may fail.
    )
) else (
    echo Gradle is already cached locally.
)

REM Set up Node.js
echo Checking Node.js environment...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js to run this application.
    pause
    exit /b
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

REM Now build the APK with offline mode
echo =================================================
echo Building APK in offline mode with extended timeouts...
echo This may take some time. Please be patient...
echo =================================================

REM Run the build command with modified settings
cd android
call gradlew assembleRelease --offline --stacktrace --no-daemon --info

REM Check if build successful
if %ERRORLEVEL% EQU 0 (
    set APK_PATH=app\build\outputs\apk\release\app-release.apk
    if exist "%APK_PATH%" (
        echo Build successful! APK created at: %APK_PATH%
        echo You can install this APK directly on your Android device.
    ) else (
        echo Build process completed but APK not found at expected location.
    )
) else (
    echo Build failed. See above for error details.
)

cd ..
echo =================================================

pause