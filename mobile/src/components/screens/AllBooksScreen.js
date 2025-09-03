import React, { useState, useCallback, useMemo, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import CustomHeader from '../ui/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import axios from "axios"
import { AuthContext } from '../../context/AuthContext';

const filters = ['Filipino', 'English', 'Uploads'];

const AllBooksScreen = () => {
  const navigation = useNavigation();
  const [books, setBooks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { state, setState } = useContext(AuthContext);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://brailliantweb.onrender.com/api/allbooks`);
      setBooks(response.data.books);
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  // Filter books based on selected filters
  const filteredBooks = useMemo(() => {
    if (selectedFilters.length === 0) return books;
    
    return books.filter((book) => {
      // Check if book matches any of the selected filters
      return selectedFilters.some(filter => {
        switch(filter) {
          case 'Filipino':
            return book.language === 'Filipino' || book.category === 'Filipino';
          case 'English':
            return book.language === 'English' || book.category === 'English';
          case 'Uploads':
            // Assuming 'Uploads' filter shows user-uploaded books
            return book.uploadedBy === state.user?.id;
          default:
            return book.category === filter || book.language === filter;
        }
      });
    });
  }, [books, selectedFilters, state.user]);

  if (loading) {
    return (
      <>
        <CustomHeader title="Library" onBack={() => navigation.goBack()} image={state.user?.user_img} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0c1536" />
        </View>
      </>
    );
  }

  return (
    <>
      <CustomHeader title="Library" onBack={() => navigation.goBack()} image={state.user?.user_img} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>All Books</Text>
          </View>

          <View style={styles.filters}>
            <Text style={styles.filterLabel}>Filters:</Text>
            {filters.map((filter) => {
              const isSelected = selectedFilters.includes(filter);
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipSelected,
                  ]}
                  onPress={() => toggleFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isSelected && styles.filterTextSelected,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FlatList
            data={filteredBooks}
            numColumns={3}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={[styles.grid, { paddingBottom: 100 }]}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.bookItem}
                onPress={() => navigation.navigate('BookDetails', { book: item })}
              >
                <View style={styles.shadowWrapper}>
                  <Image 
                    source={{ uri: item.book_img }} 
                    style={styles.bookImage} 
                    onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                  />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedFilters.length > 0 
                    ? 'No books match the selected filters.' 
                    : 'No books available.'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </>
  );
};

export default AllBooksScreen;

const { width } = Dimensions.get('window');
const imageWidth = (width - 48) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  sectionTitle: {
    fontSize: width < 600 ? 20 : 24,
    fontWeight: 'bold',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
    alignItems: 'center',
  },
  filterLabel: {
    marginRight: 8,
    fontWeight: 'bold',
  },
  filterChip: {
    backgroundColor: '#e5e5ea',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 4,
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    color: '#333',
  },
  filterTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  grid: {
    paddingTop: 8,
  },
  bookItem: {
    width: imageWidth,
    padding: 4,
  },
  bookImage: {
    width: '100%',
    height: imageWidth * 1.5,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shadowWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});