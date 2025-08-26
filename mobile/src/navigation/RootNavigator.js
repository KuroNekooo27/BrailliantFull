import React, { useEffect, useState, useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Onboarding from '../components/onBoarding/Onboarding';
import LoginScreen from '../components/screens/LoginScreen';
import AnalyticsScreen from '../components/screens/AnalyticsScreen';
import AllBooksScreen from '../components/screens/AllBooksScreen';
import ProfileScreen from '../components/screens/ProfileScreen';
import BottomTabs from './BottomTabs';

import { AuthContext } from '../context/AuthContext'; // 👈 this is important

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const { setState } = useContext(AuthContext); // 👈 grab from context

  useEffect(() => {
    const init = async () => {
      try {
        const viewed = await AsyncStorage.getItem('@viewedOnBoarding');
        const authStored = await AsyncStorage.getItem('@auth');
        
        if (!viewed) {
          setInitialRoute('Onboarding');
        } else if (authStored) {
          const auth = JSON.parse(authStored);
          if (auth?.token) {
            setState(auth); // set user and token globally
            setInitialRoute('Main');
          } else {
            setInitialRoute('Login');
          }
        } else {
          setInitialRoute('Login');
        }
      } catch (err) {
        console.log("RootNavigator init error:", err);
        setInitialRoute('Login'); // fallback
      }
    };
    init();
  }, []);

  if (!initialRoute) return null; // wait until ready

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="AllBooks" component={AllBooksScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
