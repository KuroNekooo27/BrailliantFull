import React, { useState, useContext, useEffect, useMemo } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  FlatList, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../ui/CustomHeader';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allBooks, setAllBooks] = useState([]);
  const { state, setState } = useContext(AuthContext);
  const navigation = useNavigation(); // Get navigation object

  // Fetch all books on component mount
  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const response = await axios.get('https://brailliantweb.onrender.com/api/allbooks');
        setAllBooks(response.data.books);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    
    fetchAllBooks();
  }, []);

  // Search function using the API
  const searchBooks = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using the same API endpoint with query parameters
      const response = await axios.get(`https://brailliantweb.onrender.com/api/allbooks?search=${encodeURIComponent(query)}`);
      setSearchResults(response.data.books);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to client-side search if API search fails
      const filteredBooks = allBooks.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredBooks);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchBooks(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchSubmit = () => {
    if (searchQuery) {
      searchBooks(searchQuery);
    }
  };

  // Function to handle navigation to book details
  const handleBookPress = (book) => {
    console.log("test");
    navigation.navigate('BookDetails', { book });
  };

  const imageWidth = (width - 48) / 3;

  return (
    <>
      <CustomHeader title="Search" image={state.user?.user_img} />
      <View style={styles.contentWrapper}>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search books by title, author, or category"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.input}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchIcon}
            onPress={handleSearchSubmit}
          >
            <Ionicons name="search" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0c1536" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {!isSearching && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Text>
            <FlatList
              data={searchResults}
              numColumns={3}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bookItem}
                  onPress={() => handleBookPress(item)} // Fixed navigation call
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
            />
          </View>
        )}

        {!isSearching && searchQuery && searchResults.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={50} color="#ccc" />
            <Text style={styles.noResultsText}>No books found</Text>
            <Text style={styles.noResultsSubtext}>
              Try searching with different keywords
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  contentWrapper: {
    padding: 16,
    flex: 1,
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
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: width < 600 ? 14 : 16,
    color: '#000',
  },
  searchIcon: {
    marginLeft: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  grid: {
    paddingBottom: 20,
  },
  bookItem: {
    width: (width - 48) / 3,
    padding: 4,
  },
  bookImage: {
    width: '100%',
    height: ((width - 48) / 3) * 1.5,
    borderRadius: 8,
    resizeMode: 'cover',
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
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});