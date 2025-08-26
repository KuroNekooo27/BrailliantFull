import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../components/screens/HomeScreen';
import AnalyticsScreen from '../components/screens/AnalyticsScreen';
import Grade1 from '../components/screens/Grade1';



const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    <Stack.Screen name="Grade1" component={Grade1} />
  </Stack.Navigator>
);

export default HomeStack;
