import React, { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import CustomHeader from '../ui/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import { AuthContext } from '../../context/AuthContext';

const AllBooksScreen = () => {
  const navigation = useNavigation();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { state } = useContext(AuthContext);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://brailliantweb.onrender.com/api/allbooks');
      const bookList = response.data.books || [];
      setBooks(bookList);

      // Extract unique genres
      const uniqueGenres = [...new Set(bookList.map(b => b.book_genre).filter(Boolean))];
      setGenres(uniqueGenres);
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

  const filteredBooks = useMemo(() => {
    return books.filter(b =>
      selectedGenre ? b.book_genre === selectedGenre : true
    );
  }, [books, selectedGenre]);

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
      <CustomHeader
        title="Library"
        onBack={() => navigation.goBack()}
        image={state.user?.user_img}
      />

      {/* Sticky Dropdown Section */}
      <View style={styles.stickyDropdownContainer}>
        <Text style={styles.filterLabel}>Select Genre:</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedGenre(value)}
          value={selectedGenre}
          items={[
            { label: 'All', value: null },
            ...genres.map((g) => ({ label: g, value: g })),
          ]}
          placeholder={{ label: 'Choose a genre...', value: null }}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
        />
      </View>

      {/* Scrollable Grid */}
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>All Books</Text>

          <View style={styles.grid}>
            {filteredBooks.length > 0 ? (
              <View style={styles.gridWrapper}>
                {filteredBooks.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.bookItem}
                    onPress={() => navigation.navigate('BookDetails', { book: item })}
                  >
                    <View style={styles.shadowWrapper}>
                      <Image
                        source={
                          item.book_img
                            ? { uri: item.book_img }
                            : require('../../../assets/noimg.png')
                        }
                        style={styles.bookImage}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedGenre
                    ? 'No books found for this genre.'
                    : 'No books available.'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default AllBooksScreen;

const { width } = Dimensions.get('window');
const imageWidth = (width - 48) / 3;

const styles = StyleSheet.create({
  scrollContainer: {
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
    marginBottom: 8,
  },
  stickyDropdownContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    zIndex: 100,
    elevation: 6,
  },
  filterLabel: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  grid: {
    paddingTop: 8,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  bookItem: {
    width: imageWidth,
    padding: 4,
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
  bookImage: {
    width: '100%',
    height: imageWidth * 1.5,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#fff',
  },
});
