import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';
import CauseDetailsScreen from '../screens/causeDetailsScreen';
import CharityDetailsScreen from '../screens/charityDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
// import CauseDetailsScreen from '../screens/CauseDetailsScreen';

const Stack = createNativeStackNavigator();

export default function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="MainTabs"
        component={BottomTabs}
      />

      <Stack.Screen
        name="CauseDetails"
        component={CauseDetailsScreen}
      />
      <Stack.Screen
        name="CharityDetails"
        component={CharityDetailsScreen}
      />
    </Stack.Navigator>
  );
}