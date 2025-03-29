import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ConnectionProvider } from './src/contexts/ConnectionContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ConnectionProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </NavigationContainer>
      </ConnectionProvider>
    </SafeAreaProvider>
  );
}
