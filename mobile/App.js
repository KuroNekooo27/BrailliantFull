import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { DeviceProvider } from './src/context/DeviceContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <DeviceProvider>
            <RootNavigator />
          </DeviceProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
