import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from 'react-native';
import CustomHeader from '../ui/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios'

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 16 * 2 - 12 * 2) / 3; // paddingHorizontal + spacing between 3 cards

const LibraryScreen = () => {
  const navigation = useNavigation();
  const { state } = useContext(AuthContext);
  const [books, setBooks] = useState([])


  useEffect(() => {
    axios.get('https://brailliantweb.onrender.com/api/allbooks')
      .then((response) => {
        setBooks(response.data.books)
      })
  }, [])



  return (
    <>
      <CustomHeader title="Library" image = {state.user.user_img}/>
      <ScrollView style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Braille Section */}
          <Text style={styles.sectionTitle}>Braille Characters</Text>
          <View style={styles.brailleContainer}>
            <View style={[styles.brailleCard, { backgroundColor: '#fff' }]}>
              <TouchableOpacity
                style={styles.brailleTouchable}
                onPress={() => navigation.navigate('Grade1')}
              >
                <Image source={require('../../../assets/brailleChar/G1.png')} />
                <Text style={styles.brailleText}>Grade 1{'\n'}Braille</Text>
              </TouchableOpacity>
            </View>
          </View>

          {state.user.isActivated && (
            <>
              {/* Continue Reading */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Books</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AllBooks')}>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.subTitle}>Continue Reading..</Text>

              <FlatList
                data={books}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.bookCard}
                    onPress={() => navigation.navigate('BookDetails', { book: item })} // replace with onPressBook if defined
                  >
                    <Image source={item.book_img 
                      ? { uri: item.book_img } 
                      : require('../../../assets/noimg.png')
                      } style={styles.bookImage} 
                    />
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {item.book_title}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingHorizontal: 10 }}
              />

            </>
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: width < 600 ? 20 : 24,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  viewAll: {
    color: '#1e90ff',
    fontWeight: '600',
  },
  subTitle: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
    color: '#333',
  },
  brailleContainer: {
    marginTop: 16,
    backgroundColor: '#6891C0',
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
    justifyContent: 'space-evenly',
  },
  brailleText: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: width < 600 ? 24 : 28,
  },
  bookCard: {
    width: CARD_WIDTH,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    elevation: 2,
  },
  bookImage: {
    width: '100%',
    height: CARD_WIDTH * 1.4,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  bookTitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
