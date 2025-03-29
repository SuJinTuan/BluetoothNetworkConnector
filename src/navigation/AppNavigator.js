import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import BluetoothScreen from '../screens/BluetoothScreen';
import WiFiScreen from '../screens/WiFiScreen';
import WebViewScreen from '../screens/WebViewScreen';
import ExportScreen from '../screens/ExportScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Bluetooth') {
            iconName = 'bluetooth';
          } else if (route.name === 'WiFi') {
            iconName = 'wifi';
          } else if (route.name === 'WebView') {
            iconName = 'globe';
          } else if (route.name === 'Export') {
            iconName = 'code';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: '#757575',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
          paddingTop: 5,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bluetooth" component={BluetoothScreen} />
      <Tab.Screen name="WiFi" component={WiFiScreen} />
      <Tab.Screen name="WebView" component={WebViewScreen} />
      <Tab.Screen name="Export" component={ExportScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
