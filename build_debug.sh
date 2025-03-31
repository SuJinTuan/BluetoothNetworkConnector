#!/bin/bash

# Define color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}  ConnectivityApp Debug Builder     ${NC}"
echo -e "${BLUE}====================================${NC}"

# Navigate to project root
cd "$(dirname "$0")"

# Show environment information
echo -e "${CYAN}=== Environment Information ===${NC}"
echo -e "${YELLOW}Node version:${NC} $(node -v 2>/dev/null || echo 'Not installed')"
echo -e "${YELLOW}npm version:${NC} $(npm -v 2>/dev/null || echo 'Not installed')"
echo -e "${YELLOW}Java version:${NC} $(java -version 2>&1 | grep version || echo 'Not installed')"
echo -e "${YELLOW}Gradle version:${NC} $(cd android && ./gradlew -v 2>&1 | grep Gradle || echo 'Not installed')"
echo -e "${YELLOW}Android SDK location:${NC} ${ANDROID_HOME:-'Not set'}"
echo -e "${YELLOW}React Native CLI:${NC} $(npx react-native --version 2>/dev/null || echo 'Not installed')"
echo -e "${YELLOW}Expo CLI:${NC} $(npx expo --version 2>/dev/null || echo 'Not installed')"
echo -e "${YELLOW}Operating System:${NC} $(uname -a)"
echo -e "${YELLOW}Free disk space:${NC} $(df -h . | grep -v Filesystem)"
echo -e "${YELLOW}Memory:${NC} $(free -h 2>/dev/null || echo 'Command not available')"

# Verify project structure
echo -e "\n${CYAN}=== Project Structure Verification ===${NC}"
echo -e "${YELLOW}Checking essential project files...${NC}"

MISSING_FILES=0
for file in "package.json" "app.json" "android/build.gradle" "android/settings.gradle" "android/app/build.gradle"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}Missing file: $file${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    else
        echo -e "${GREEN}Found: $file${NC}"
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${RED}Warning: $MISSING_FILES essential files are missing!${NC}"
else
    echo -e "${GREEN}All essential project files present.${NC}"
fi

# Clear caches and temp files
echo -e "\n${CYAN}=== Cleaning Caches ===${NC}"
echo -e "${YELLOW}Cleaning npm cache...${NC}"
npm cache verify

echo -e "${YELLOW}Cleaning watchman cache...${NC}"
watchman watch-del-all 2>/dev/null || echo -e "${YELLOW}Watchman not available, skipping...${NC}"

echo -e "${YELLOW}Cleaning temporary build files...${NC}"
rm -rf android/app/build
rm -rf android/.gradle

echo -e "${YELLOW}Cleaning Metro bundler cache...${NC}"
rm -rf $TMPDIR/metro-* 2>/dev/null || echo -e "${YELLOW}No Metro cache to clean.${NC}"

# Verify dependencies
echo -e "\n${CYAN}=== Dependency Verification ===${NC}"
echo -e "${YELLOW}Checking package.json dependencies...${NC}"
npm ls --depth=0

echo -e "\n${YELLOW}Checking for broken dependencies...${NC}"
npm audit || echo -e "${YELLOW}Audit completed with warnings${NC}"

# Setup environment for verbose Gradle
echo -e "\n${CYAN}=== Setting up Gradle Debug Environment ===${NC}"

# Increase Gradle memory and add debug flags
export GRADLE_OPTS="-Xmx4g -XX:MaxPermSize=2048m -XX:+HeapDumpOnOutOfMemoryError -Dorg.gradle.daemon=false -Dorg.gradle.debug=true -Dorg.gradle.logging.level=debug"

# Create gradle debug properties
echo -e "${YELLOW}Setting up Gradle for debug build...${NC}"
GRADLE_PROPS_PATH="android/gradle.properties"
if [ -f "$GRADLE_PROPS_PATH" ]; then
    # Backup original gradle.properties
    cp "$GRADLE_PROPS_PATH" "$GRADLE_PROPS_PATH.bak"
    
    # Add debug settings
    echo "" >> "$GRADLE_PROPS_PATH"
    echo "# Debug build settings" >> "$GRADLE_PROPS_PATH"
    echo "org.gradle.jvmargs=-Xmx4g -XX:MaxPermSize=2048m -XX:+HeapDumpOnOutOfMemoryError" >> "$GRADLE_PROPS_PATH"
    echo "org.gradle.daemon=false" >> "$GRADLE_PROPS_PATH"
    echo "org.gradle.parallel=false" >> "$GRADLE_PROPS_PATH"
    echo "org.gradle.configureondemand=false" >> "$GRADLE_PROPS_PATH"
    echo "org.gradle.debug=true" >> "$GRADLE_PROPS_PATH"
    echo "org.gradle.logging.level=debug" >> "$GRADLE_PROPS_PATH"
    echo "android.enableDexingArtifactTransform.desugaring=false" >> "$GRADLE_PROPS_PATH"
else
    echo -e "${RED}Warning: gradle.properties not found at $GRADLE_PROPS_PATH${NC}"
fi

# Build with verbose output
echo -e "\n${CYAN}=== Starting Debug Build ===${NC}"
echo -e "${YELLOW}Building debug APK with verbose logging...${NC}"
cd android

# Run Gradle with --debug and --stacktrace
./gradlew assembleDebug --debug --stacktrace --scan --info > ../gradle-build-log.txt 2>&1

# Check build result
BUILD_RESULT=$?
if [ $BUILD_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Debug build successful!${NC}"
    echo -e "${GREEN}📱 APK location: $(find ./app/build/outputs -name "*.apk" | head -1)${NC}"
    
    # Copy to build directory for easier access
    mkdir -p ../build
    cp $(find ./app/build/outputs -name "*.apk" | head -1) ../build/
    echo -e "${GREEN}📦 APK copied to build directory for easier access${NC}"
else
    echo -e "${RED}❌ Build failed with exit code $BUILD_RESULT${NC}"
    
    # Extract and display the most relevant error information
    echo -e "\n${CYAN}=== Build Error Summary ===${NC}"
    echo -e "${YELLOW}Extracting error information from log...${NC}"
    
    echo -e "\n${RED}Last few error messages:${NC}"
    grep -A 10 "FAILURE:" ../gradle-build-log.txt | head -20
    
    echo -e "\n${RED}Execution exceptions:${NC}"
    grep -A 10 "Exception" ../gradle-build-log.txt | grep -v "at " | head -20
    
    echo -e "\n${YELLOW}Full build log saved to gradle-build-log.txt${NC}"
fi

# Return to root directory
cd ..

# Restore original gradle.properties
if [ -f "$GRADLE_PROPS_PATH.bak" ]; then
    mv "$GRADLE_PROPS_PATH.bak" "$GRADLE_PROPS_PATH"
fi

echo -e "\n${CYAN}=== Gradle Task Dependencies ===${NC}"
echo -e "${YELLOW}Showing task dependencies for assembleDebug...${NC}"
cd android
./gradlew :app:dependencies --configuration implementation > ../gradle-dependencies.txt
cd ..
echo -e "${GREEN}Dependencies saved to gradle-dependencies.txt${NC}"

echo -e "\n${BLUE}🚀 Debug build process complete!${NC}"
echo -e "${YELLOW}If build failed, check gradle-build-log.txt for details.${NC}"
echo -e "${YELLOW}Consider running with 'adb logcat' to see runtime errors.${NC}"