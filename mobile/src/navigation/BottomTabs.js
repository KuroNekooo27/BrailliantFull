import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';

import DeviceSettingsScreen from '../components/screens/DeviceSettingsScreen';
import TextToBrailleScreen from '../components/screens/TextToBrailleScreen';
import HomeStack from './HomeStack';
import LibraryStack from './LibraryStack';
import SearchStack from './SearchStack';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(width > height);
  const [fontScale, setFontScale] = useState(1);
  
  // Update orientation and font scale when dimensions change
  useEffect(() => {
    setIsLandscape(width > height);
    const scale = Math.min(width / 375, 1.2); // Base width of 375 (iPhone 6/7/8)
    setFontScale(scale);
  }, [width, height]);

  // Responsive tab bar height
  const tabBarHeight = isLandscape ? 70 : 90;
  
  // Responsive icon size
  const iconSize = isLandscape ? 20 : 24;
  
  // Responsive font size
  const labelFontSize = Math.max(8, Math.min(10, 10 * fontScale));

  return (
    <View style={[styles.tabContainer, { height: tabBarHeight }]}>
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
            <Animated.View style={{ 
              transform: [{ scale: scaleAnim }], 
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons
                name={icon}
                size={iconSize}
                color={isFocused ? '#0c1536' : '#d1cfd6'}
              />
              <Text
                style={[
                  styles.label, 
                  { fontSize: labelFontSize, lineHeight: labelFontSize + 2 },
                  isFocused ? styles.activeLabel : styles.inactiveLabel
                ]}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {route.name === 'Braille' ? 'Text-to-Braille' : route.name === 'Settings' ? 'Device Settings' : route.name}
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
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is open
      }} 
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Library" component={LibraryStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Braille" component={TextToBrailleScreen} />
      <Tab.Screen name="Settings" component={DeviceSettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
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
    paddingVertical: 5,
    maxWidth: 100, // Prevent tabs from becoming too wide on large screens
  },
  label: {
    textAlign: 'center',
    marginTop: 4,
    flexShrink: 1, // Allow text to shrink if needed
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#0c1536',
    paddingTop: 10,
  },
});