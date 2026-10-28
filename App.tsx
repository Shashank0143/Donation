import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabs from './src/navigation/BottomTabs';
import RootStack from './src/navigation/rootStack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import './src/config/googleSignin';
import GlobalLoader from './src/components/GlobalLoader';
// import BottomTabs from './src/navigation/BottomTabs';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#23345D"
      />
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
      <GlobalLoader />
      <Toast
        position="bottom"
        bottomOffset={80}
        visibilityTime={1000}
      />
    </SafeAreaProvider>
  );
}