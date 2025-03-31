#!/bin/bash

# Set environment variables for Gradle
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Navigate to Android directory
cd android

# Clean old build files
./gradlew clean

# Build Debug APK
./gradlew assembleDebug

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "✅ Debug APK build successful!"
  echo "📱 APK location: $(find ./app/build/outputs -name "*.apk" | head -1)"
  
  # Copy APK to root directory for easier access
  mkdir -p ../build
  cp $(find ./app/build/outputs -name "*.apk" | head -1) ../build/
  echo "📦 APK copied to build directory for easier access"
else
  echo "❌ Build failed"
  exit 1
fi

# Return to root directory
cd ..

echo "🚀 Build process complete!"