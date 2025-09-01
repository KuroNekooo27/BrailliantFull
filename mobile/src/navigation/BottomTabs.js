import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';

import SearchScreen from '../components/screens/SearchScreen';
import DeviceSettingsScreen from '../components/screens/DeviceSettingsScreen';
import TextToBrailleScreen from '../components/screens/TextToBrailleScreen';
import HomeStack from './HomeStack';
import LibraryStack from './LibraryStack';


const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          navigation.navigate(route.name);
        };

        const icon = getIcon(route.name);
        const scaleAnim = React.useRef(new Animated.Value(isFocused ? 1.2 : 1)).current;

        useEffect(() => {
          Animated.timing(scaleAnim, {
            toValue: isFocused ? 1.2 : 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }, [isFocused]);

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={[styles.tabButton, isFocused && styles.activeTab]}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
              <Ionicons
                name={icon}
                size={24}
                color={isFocused ? '#0c1536' : '#d1cfd6'}
              />
              <Text
                style={[styles.label, isFocused ? styles.activeLabel : styles.inactiveLabel]}
              >
                {route.name === 'Braille' ? 'Text-to-\nBraille' : route.name === 'Settings' ? 'Device\nSettings' : route.name}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getIcon = (name) => {
  switch (name) {
    case 'Home':
      return 'home-outline';
    case 'Library':
      return 'book-outline';
    case 'Search':
      return 'search';
    case 'Braille':
      return 'grid-outline';
    case 'Settings':
      return 'settings-outline';
    default:
      return 'home-outline';
  }
};

export default function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Library" component={LibraryStack} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Braille" component={TextToBrailleScreen} />
      <Tab.Screen name="Settings" component={DeviceSettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    height: 90,
    paddingBottom: 10,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  activeLabel: {
    color: '#0c1536',
    fontWeight: 'bold',
  },
  inactiveLabel: {
    color: '#d1cfd6',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#0c1536',
    paddingTop: 10,
    marginHorizontal:1,
  },
});
