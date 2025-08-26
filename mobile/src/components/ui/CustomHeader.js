import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, Pressable,Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDevice } from '../../context/DeviceContext';


const CustomHeader = ({ title = '', subtitle = '', onBack, image}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [showMenu, setShowMenu] = useState(false);
  const { connectedDevice } = useDevice();


  const handleLogout = async () => {
    setShowMenu(false);
    await AsyncStorage.removeItem('@auth');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  return (
    <View style={{ position: 'relative', zIndex: 100 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0c1536" />
      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        <View style={styles.leftSection}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          <View>
            {subtitle ? 
              <>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
              </>
              : <Text style={[styles.title,{fontSize:25}]}>{title}</Text>}
        </View>
        </View>
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
            <Image source={image} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay and Dropdown */}
      {showMenu && (
        <>
          <Pressable
            style={styles.fullscreenOverlay}
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.dropdownMenu}>
              <TouchableOpacity onPress={() => {
                setShowMenu(false);
                navigation.navigate('Profile');
              }}>
                <Text style={styles.menuItem}>Profile</Text>
              </TouchableOpacity>
              <Text style={[ styles.menuItem, { color: connectedDevice ? 'green' : 'gray' },]}>
                Device: {connectedDevice ? 'Connected' : 'Disconnected'}
              </Text>

              <TouchableOpacity onPress={handleLogout}>
                <Text style={[styles.menuItem, { color: 'red' }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </>
      )}
    </View>
  );
};

export default CustomHeader;


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0c1536',
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 100,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#fff',
    marginTop: 2,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  redDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 4,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    zIndex: 100,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: 8,
    fontSize: 14,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
});
