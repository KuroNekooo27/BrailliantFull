import React, { useState, useContext } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../ui/CustomHeader';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { state, setState } = useContext(AuthContext);

  return (
    <>
      <CustomHeader title="Search" image={state.user.user_img} />
      <View style={styles.contentWrapper}>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search books"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.input}
          />
          <TouchableOpacity style={styles.searchIcon}>
            <Ionicons name="search" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        {/* Additional content can go here */}
      </View>
    </>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2', // Light gray background
  },
  contentWrapper: {
    padding: 16,
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: width < 600 ? 14 : 16, // Smaller font size for smaller screens
    color: '#000',
  },
  searchIcon: {
    marginLeft: 10,
  },
});
