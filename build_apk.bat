@echo off
echo ===== ConnectivityApp APK Builder =====

REM Navigate to Android directory
cd android

REM Clean old build files
call gradlew clean

REM Build Debug APK
call gradlew assembleDebug

REM Check if build was successful
if %ERRORLEVEL% == 0 (
  echo [SUCCESS] Debug APK build successful!
  
  REM Find the APK file
  for /f "tokens=*" %%a in ('dir /b /s "app\build\outputs\*.apk"') do (
    echo APK location: %%a
    
    REM Copy APK to root directory for easier access
    mkdir ..\build 2> nul
    copy "%%a" ..\build\
    echo APK copied to build directory for easier access
    goto :success
  )
) else (
  echo [ERROR] Build failed!
  cd ..
  exit /b 1
)

:success
REM Return to root directory
cd ..

echo Build process complete!