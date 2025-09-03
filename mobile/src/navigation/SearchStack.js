import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookDetailsScreen from '../components/screens/BookDetails';
import BookReadSessionScreen from '../components/screens/BookReadSessionScreen';
import SearchScreen from '../components/screens/SearchScreen';

const Stack = createNativeStackNavigator();

const SearchStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
      <Stack.Screen name="ReadSession" component={BookReadSessionScreen} />
    </Stack.Navigator>
  );
};

export default SearchStack;
