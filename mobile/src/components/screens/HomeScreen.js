import React, { useMemo, useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import CustomHeader from '../ui/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios'

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { state } = useContext(AuthContext);
  const [BOOKS_DATA, setBooks] = useState([])

  useEffect(() => {
    axios.get(`https://brailliantweb.onrender.com/api/allbooks`)
      .then((response) => {
        setBooks(response.data.books)
      })
      .catch((error) => {
        console.log("eto ang error mo " + error)
      })
  }, [])

  const { topBooks } = useMemo(() => {
    const sorted = [...BOOKS_DATA].sort((a, b) => b.book_count - a.book_count);
    const top = sorted.slice(0, 3);
    return { topBooks: top };
  }, [BOOKS_DATA]);

  let greeting = `Hello, Teacher ${state?.user?.user_fname}`;

  return (
    <>
      <CustomHeader title="Home" subtitle={greeting} image ={state.user.user_img} />
      <ScrollView style={styles.container}>
        <View style={styles.contentWrapper}>
          {state.user.isActivated && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Analytics</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
                  <Text style={styles.viewMore}>View More &gt;</Text>
                </TouchableOpacity>
              </View>

              {topBooks.map((book, index) => (
                <View key={book.book_title} style={styles.topBookCard}>
                  <Text style={styles.rank}>#{index + 1}</Text>
                  <Image source={book.book_img} style={styles.bookImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookTitle}>{book.book_title}</Text>
                    <Text style={styles.accessCount}>Access Count: {book.book_count}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
          {/* Braille Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Braille Characters</Text>
          </View>
          <View style={styles.brailleContainer}>
            <View style={[styles.brailleCard, { backgroundColor: '#fff' }]}>
              <TouchableOpacity style={styles.brailleTouchable} onPress={() => navigation.navigate('Grade1')}>
                <Image source={require('../../../assets/brailleChar/G1.png')} />
                <Text style={styles.brailleText}>Grade 1{'\n'}Braille</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-evenly',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: width < 600 ? 20 : 24, // Smaller font size for smaller screens
    fontWeight: 'bold',
  },
  viewMore: {
    color: '#1e90ff',
    fontWeight: '600',
  },
  analyticsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  analyticsImage: {
    width: 80,
    height: 110,
    borderRadius: 8,
  },
  analyticsTextContainer: {
    marginLeft: 16,
  },
  bookText: {
    fontSize: width < 600 ? 14 : 16, // Smaller font size for smaller screens
  },
  brailleContainer: {
    marginTop: 16,
    backgroundColor: "#6891C0",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  brailleCard: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3f6fbe',
    padding: 16,
  },
  brailleTouchable: {
    flexDirection: 'row',
    justifyContent: "space-evenly",
  },
  brailleText: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: width < 600 ? 24 : 28, // Smaller font size for smaller screens
  },
  topBookCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: { fontSize: 20, fontWeight: 'bold', color: '#FFA500', marginRight: 12 },
  bookImage: { width: 60, height: 90, borderRadius: 8, marginRight: 12 },
  bookTitle: { fontSize: 16, fontWeight: '600' },
  accessCount: { fontSize: 14, color: '#555' },
});
