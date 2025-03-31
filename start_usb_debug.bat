@echo off
SETLOCAL EnableDelayedExpansion

:: Colors for console output
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"
set "BLUE=[34m"
set "NC=[0m"

:: Print banner
echo %BLUE%===================================%NC%
echo %BLUE%  ConnectivityApp USB Debug Tool   %NC%
echo %BLUE%===================================%NC%

:: Check if ADB is available
where adb >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%ADB is not installed or not in PATH.%NC%
    echo %YELLOW%Please install Android SDK Platform Tools.%NC%
    goto :end
)

:: Start ADB server if not running
echo %YELLOW%Starting ADB server...%NC%
adb start-server

:: Check for connected devices
echo %YELLOW%Checking for connected devices...%NC%
for /f "tokens=*" %%a in ('adb devices ^| findstr "device$" ^| findstr /v "List"') do (
    set "DEVICES=%%a"
)

if not defined DEVICES (
    echo %RED%No devices connected!%NC%
    echo %YELLOW%Please connect an Android device with USB debugging enabled.%NC%
    goto :end
)

:: Show connected devices
echo %GREEN%Found the following devices:%NC%
adb devices | findstr /v "List"

:: Build the debug APK
echo %YELLOW%Building debug APK...%NC%

:: Check if APK already exists
set "APK_PATH=.\android\app\build\outputs\apk\debug\app-debug.apk"
if not exist "%APK_PATH%" (
    echo %YELLOW%Debug APK not found. Building now...%NC%
    
    :: Build debug APK
    cd android
    call gradlew assembleDebug
    
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%Build failed!%NC%
        cd ..
        goto :end
    )
    
    cd ..
    echo %GREEN%Build successful!%NC%
) else (
    echo %GREEN%Using existing debug APK.%NC%
)

:: Install the app on the connected device(s)
echo %YELLOW%Installing app on connected devices...%NC%
for /f "tokens=1" %%d in ('adb devices ^| findstr /r /v "List" ^| findstr /r "device$"') do (
    echo %YELLOW%Installing on device: %%d%NC%
    adb -s %%d install -r "%APK_PATH%"
    
    if %ERRORLEVEL% EQU 0 (
        echo %GREEN%Installation successful on %%d%NC%
        
        :: Start the app
        echo %YELLOW%Starting app on %%d...%NC%
        adb -s %%d shell am start -n com.connectivityapp/.MainActivity
        
        if %ERRORLEVEL% EQU 0 (
            echo %GREEN%App started successfully on %%d%NC%
        ) else (
            echo %RED%Failed to start app on %%d%NC%
        )
    ) else (
        echo %RED%Installation failed on %%d%NC%
    )
)

:: Show logs
echo %YELLOW%Showing logs from the app:%NC%
echo %BLUE%(Press Ctrl+C to stop logging)%NC%
echo %YELLOW%=============== LOG OUTPUT ===============%NC%
adb logcat -v time | findstr /r "ConnectivityApp Bluetooth WiFi ReactNative System.err Exception Error"

:end
ENDLOCAL