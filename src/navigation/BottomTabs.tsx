import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Image } from 'react-native';
import { verticalScale ,scale , moderateScale } from '../utils/responsive';
const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B8DBD',
        tabBarInactiveTintColor: '#6B7280',
        tabBarIcon: ({ focused }) => {
          let icon = "";

          if (route.name === 'Home') icon = focused ? require('../assets/images/home_active.png') : require('../assets/images/home_inactive.png');
          if (route.name === 'Explore') icon = focused ? require('../assets/images/search_active.png') : require('../assets/images/search_inactive.png');
          if (route.name === 'Saved') icon = focused ? require('../assets/images/heart_active.png') : require('../assets/images/heart_inactive.png');
          if (route.name === 'Profile') icon = focused ? require('../assets/images/user_active.png') : require('../assets/images/user_inactive.png');
          return <Image
            source={icon}
            style={{ height: verticalScale(20), width: scale(20) }}
            resizeMode="contain"
          />
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
export default BottomTabs;