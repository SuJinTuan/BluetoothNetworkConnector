@echo off
SETLOCAL EnableDelayedExpansion

:: Colors for console output
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"
set "BLUE=[34m"
set "CYAN=[36m"
set "NC=[0m"

:: Print banner
echo %BLUE%====================================%NC%
echo %BLUE%  ConnectivityApp Debug Builder     %NC%
echo %BLUE%====================================%NC%

:: Show environment information
echo %CYAN%=== Environment Information ===%NC%
echo %YELLOW%Node version:%NC% 
node -v 2>nul || echo Not installed

echo %YELLOW%npm version:%NC% 
npm -v 2>nul || echo Not installed

echo %YELLOW%Java version:%NC% 
java -version 2>&1 | findstr "version" || echo Not installed

echo %YELLOW%Android SDK location:%NC% %ANDROID_HOME%

echo %YELLOW%React Native CLI:%NC% 
npx react-native --version 2>nul || echo Not installed

echo %YELLOW%Expo CLI:%NC% 
npx expo --version 2>nul || echo Not installed

echo %YELLOW%Operating System:%NC% 
ver

echo %YELLOW%Free disk space:%NC% 
wmic logicaldisk where "DeviceID='%~d0'" get FreeSpace,Size

:: Verify project structure
echo.
echo %CYAN%=== Project Structure Verification ===%NC%
echo %YELLOW%Checking essential project files...%NC%

set MISSING_FILES=0
for %%f in (package.json app.json android\build.gradle android\settings.gradle android\app\build.gradle) do (
    if not exist "%%f" (
        echo %RED%Missing file: %%f%NC%
        set /a MISSING_FILES+=1
    ) else (
        echo %GREEN%Found: %%f%NC%
    )
)

if %MISSING_FILES% GTR 0 (
    echo %RED%Warning: %MISSING_FILES% essential files are missing!%NC%
) else (
    echo %GREEN%All essential project files present.%NC%
)

:: Clear caches and temp files
echo.
echo %CYAN%=== Cleaning Caches ===%NC%
echo %YELLOW%Cleaning npm cache...%NC%
call npm cache verify

echo %YELLOW%Cleaning temporary build files...%NC%
if exist "android\app\build" rmdir /s /q "android\app\build"
if exist "android\.gradle" rmdir /s /q "android\.gradle"

:: Verify dependencies
echo.
echo %CYAN%=== Dependency Verification ===%NC%
echo %YELLOW%Checking package.json dependencies...%NC%
call npm ls --depth=0

echo.
echo %YELLOW%Checking for broken dependencies...%NC%
call npm audit || echo %YELLOW%Audit completed with warnings%NC%

:: Setup environment for verbose Gradle
echo.
echo %CYAN%=== Setting up Gradle Debug Environment ===%NC%

:: Increase Gradle memory and add debug flags
set "GRADLE_OPTS=-Xmx4g -XX:MaxPermSize=2048m -XX:+HeapDumpOnOutOfMemoryError -Dorg.gradle.daemon=false -Dorg.gradle.debug=true -Dorg.gradle.logging.level=debug"

:: Create gradle debug properties
echo %YELLOW%Setting up Gradle for debug build...%NC%
set "GRADLE_PROPS_PATH=android\gradle.properties"
if exist "%GRADLE_PROPS_PATH%" (
    :: Backup original gradle.properties
    copy "%GRADLE_PROPS_PATH%" "%GRADLE_PROPS_PATH%.bak"
    
    :: Add debug settings
    echo. >> "%GRADLE_PROPS_PATH%"
    echo # Debug build settings >> "%GRADLE_PROPS_PATH%"
    echo org.gradle.jvmargs=-Xmx4g -XX:MaxPermSize=2048m -XX:+HeapDumpOnOutOfMemoryError >> "%GRADLE_PROPS_PATH%"
    echo org.gradle.daemon=false >> "%GRADLE_PROPS_PATH%"
    echo org.gradle.parallel=false >> "%GRADLE_PROPS_PATH%"
    echo org.gradle.configureondemand=false >> "%GRADLE_PROPS_PATH%"
    echo org.gradle.debug=true >> "%GRADLE_PROPS_PATH%"
    echo org.gradle.logging.level=debug >> "%GRADLE_PROPS_PATH%"
    echo android.enableDexingArtifactTransform.desugaring=false >> "%GRADLE_PROPS_PATH%"
) else (
    echo %RED%Warning: gradle.properties not found at %GRADLE_PROPS_PATH%%NC%
)

:: Build with verbose output
echo.
echo %CYAN%=== Starting Debug Build ===%NC%
echo %YELLOW%Building debug APK with verbose logging...%NC%
cd android

:: Run Gradle with --debug and --stacktrace
call gradlew assembleDebug --debug --stacktrace --scan --info > ..\gradle-build-log.txt 2>&1

:: Check build result
set BUILD_RESULT=%ERRORLEVEL%
if %BUILD_RESULT% EQU 0 (
    echo %GREEN%[SUCCESS] Debug build successful!%NC%
    
    :: Find the APK file
    for /f "tokens=*" %%a in ('dir /b /s "app\build\outputs\*.apk"') do (
        echo %GREEN%APK location: %%a%NC%
        
        :: Copy to build directory for easier access
        mkdir ..\build 2>nul
        copy "%%a" ..\build\
        echo %GREEN%APK copied to build directory for easier access%NC%
        goto :build_success
    )
    
    :build_success
) else (
    echo %RED%[ERROR] Build failed with exit code %BUILD_RESULT%%NC%
    
    :: Extract and display the most relevant error information
    echo.
    echo %CYAN%=== Build Error Summary ===%NC%
    echo %YELLOW%Extracting error information from log...%NC%
    
    echo.
    echo %RED%Last few error messages:%NC%
    findstr /C:"FAILURE:" ..\gradle-build-log.txt
    
    echo.
    echo %RED%Execution exceptions:%NC%
    findstr /C:"Exception" ..\gradle-build-log.txt
    
    echo.
    echo %YELLOW%Full build log saved to gradle-build-log.txt%NC%
)

:: Return to root directory
cd ..

:: Restore original gradle.properties
if exist "%GRADLE_PROPS_PATH%.bak" (
    move /Y "%GRADLE_PROPS_PATH%.bak" "%GRADLE_PROPS_PATH%"
)

echo.
echo %CYAN%=== Gradle Task Dependencies ===%NC%
echo %YELLOW%Showing task dependencies for assembleDebug...%NC%
cd android
call gradlew :app:dependencies --configuration implementation > ..\gradle-dependencies.txt
cd ..
echo %GREEN%Dependencies saved to gradle-dependencies.txt%NC%

echo.
echo %BLUE%Debug build process complete!%NC%
echo %YELLOW%If build failed, check gradle-build-log.txt for details.%NC%
echo %YELLOW%Consider running with 'adb logcat' to see runtime errors.%NC%

ENDLOCAL