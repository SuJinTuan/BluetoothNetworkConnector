import './src/utils/polyfills'; // Import polyfills first so they're available throughout the app
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ConnectionProvider } from './src/contexts/ConnectionContext';
import { ExportServiceProvider } from './src/services/ExportService';

export default function App() {
  return (
    <SafeAreaProvider>
      <ConnectionProvider>
        <ExportServiceProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" />
            <AppNavigator />
          </NavigationContainer>
        </ExportServiceProvider>
      </ConnectionProvider>
    </SafeAreaProvider>
  );
}
