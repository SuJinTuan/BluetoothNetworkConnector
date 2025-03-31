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
echo %BLUE%  ConnectivityApp Offline Builder   %NC%
echo %BLUE%===================================%NC%

:: Disable telemetry and analytics
echo %YELLOW%Disabling telemetry and analytics...%NC%
set EXPO_NO_TELEMETRY=1
set NEXT_TELEMETRY_DISABLED=1
set ASTRO_TELEMETRY_DISABLED=1
set GATSBY_TELEMETRY_DISABLED=1
set NETLIFY_TELEMETRY_DISABLED=1
set REACT_NATIVE_TELEMETRY_ENABLED=0

:: Set Gradle to offline mode
set GRADLE_OPTS=-Dorg.gradle.offline=true -Dgradle.wrapper.offline.allowed=true

:: Check for cached dependencies
echo %YELLOW%Checking for cached npm dependencies...%NC%
if not exist "node_modules" (
    echo %RED%Error: node_modules directory not found.%NC%
    echo %YELLOW%You need to run 'npm install' while online at least once before using offline build.%NC%
    goto :error
)

:: Install dependencies in offline mode
echo %YELLOW%Installing dependencies in offline mode...%NC%
call npm install --prefer-offline --no-audit --no-fund --loglevel=error
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Error: Failed to install dependencies in offline mode.%NC%
    goto :error
)

:: Configure Gradle for offline build
echo %YELLOW%Configuring Gradle for offline build...%NC%
set "GRADLE_PROPS_PATH=android\gradle.properties"
if exist "%GRADLE_PROPS_PATH%" (
    :: Backup original gradle.properties
    copy "%GRADLE_PROPS_PATH%" "%GRADLE_PROPS_PATH%.bak"
    
    :: Add offline settings
    echo. >> "%GRADLE_PROPS_PATH%"
    echo # Offline build settings >> "%GRADLE_PROPS_PATH%"
    echo org.gradle.offline=true >> "%GRADLE_PROPS_PATH%"
    echo org.gradle.wrapper.offline.allowed=true >> "%GRADLE_PROPS_PATH%"
) else (
    echo %RED%Warning: gradle.properties not found at %GRADLE_PROPS_PATH%%NC%
)

:: Build debug APK in offline mode
echo %YELLOW%Building debug APK in offline mode...%NC%
cd android

:: Clean might not work in offline mode, so skip it
echo %YELLOW%Skipping clean task in offline mode...%NC%

:: Build the APK with offline flag
call gradlew --offline assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Error: Failed to build APK in offline mode.%NC%
    
    :: Restore gradle.properties if it was modified
    if exist "..\%GRADLE_PROPS_PATH%.bak" (
        move /Y "..\%GRADLE_PROPS_PATH%.bak" "..\%GRADLE_PROPS_PATH%"
    )
    
    cd ..
    goto :error
)

:: Return to project root
cd ..

:: Restore original gradle.properties
if exist "%GRADLE_PROPS_PATH%.bak" (
    move /Y "%GRADLE_PROPS_PATH%.bak" "%GRADLE_PROPS_PATH%"
)

:: Check if build was successful
set "APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk"
if exist "%APK_PATH%" (
    echo %GREEN%[SUCCESS] Offline build successful!%NC%
    echo %GREEN%APK location: %APK_PATH%%NC%
    
    :: Copy to build directory for easier access
    mkdir build 2>nul
    copy "%APK_PATH%" build\
    echo %GREEN%APK copied to build directory for easier access%NC%
) else (
    echo %RED%[ERROR] Build failed: APK not found at expected location%NC%
    goto :error
)

echo %BLUE%Build process complete!%NC%
goto :end

:error
echo %RED%Build process failed!%NC%
exit /b 1

:end
ENDLOCAL