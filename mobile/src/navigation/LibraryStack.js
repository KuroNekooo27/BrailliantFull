import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LibraryScreen from '../components/screens/LibraryScreen';
import AllBooksScreen from '../components/screens/AllBooksScreen';
import BookDetailsScreen from '../components/screens/BookDetails';
import BookReadSessionScreen from '../components/screens/BookReadSessionScreen';
import Grade1 from '../components/screens/Grade1';

const Stack = createNativeStackNavigator();

const LibraryStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryMain" component={LibraryScreen} />
      <Stack.Screen name="AllBooks" component={AllBooksScreen} />
      <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
      <Stack.Screen name="ReadSession" component={BookReadSessionScreen} />
      <Stack.Screen name="Grade1" component={Grade1} />
    </Stack.Navigator>
  );
};

export default LibraryStack;
