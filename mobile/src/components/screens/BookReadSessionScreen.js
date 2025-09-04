import React, { useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import CustomHeader from '../ui/CustomHeader';
import { convertTextToBrailleDots } from '../brailleConverter/brailleConverter';
import BrailleLetter from '../brailleConverter/BrailleLetter';
import { useDevice } from '../../context/DeviceContext';
import DisconnectionModal from '../ui/DisconnectionModal';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import SessionSummaryModal from '../ui/SessionSummaryModal'; 

const CHUNK_SIZE = 8;
const { width } = Dimensions.get('window');

const BookReadSessionScreen = ({ route }) => {
  const navigation = useNavigation();
  const [fullText, setFullText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { connectedDevice, setConnectedDevice } = useDevice();
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const { state, setState } = useContext(AuthContext);
  const [sessionStartTime] = useState(Date.now());

  const { bookTitle = 'Unknown Book', bookUrl = '', studentName = 'Unknown Student' } = route.params || {};


  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this reading session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            setShowSummary(true); // show modal first
          }
        },
      ]
    );
  };

  const getElapsedTime = () => {
    const diff = Date.now() - sessionStartTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const sessionData = {
    date: new Date().toLocaleDateString(),
    studentName: studentName,
    book: bookTitle,
    timeElapsed: getElapsedTime(),
  };  

  useEffect(() => {
    if (!connectedDevice) return;

    const monitor = connectedDevice.onDisconnected(() => {
      setConnectedDevice(null);
      setIsDisconnected(true);
    });

    return () => monitor.remove();
  }, [connectedDevice]);

  const handleSync = () => {
    if (!connectedDevice) {
      Alert.alert(
        'No Device Connected',
        'Please connect your Brailliant RBD before syncing text.'
      );
      return;
    }

    // TODO: send text to device via BLE here
    console.log('Sending Braille data:', text);
  };

  useEffect(() => {
    const loadBookContent = async () => {
      if (!bookUrl) {
        setError("No book URL provided.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('https://brailliantweb.onrender.com/extract-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ pdfUrl: bookUrl })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const content = await response.text();
        setFullText(content.trim());
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading book content:', err);
        setError(`Failed to load book content. Error: ${err.message}. Please check the book URL.`);
        setIsLoading(false);
      }
    };
    loadBookContent();
  }, [bookUrl]);

  const [startIndex, setStartIndex] = useState(0);
  const endIndex = startIndex + CHUNK_SIZE;
  const before = fullText.slice(0, startIndex);
  const highlighted = fullText.slice(startIndex, endIndex);
  const after = fullText.slice(endIndex);

  const handlePrev = () => {
    if (startIndex >= CHUNK_SIZE) {
      setStartIndex(startIndex - CHUNK_SIZE);
    }
  };

  const handleNext = () => {
    if (endIndex < fullText.length) {
      setStartIndex(startIndex + CHUNK_SIZE);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading book...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title={bookTitle} image={state.user.user_img} />

      <View style={styles.headerRow}>
        <Text style={styles.bookTitle}>{bookTitle}</Text>
        <View style={styles.pageNav}>
          <Text style={styles.pageIndicator}>
            Page {Math.floor(startIndex / CHUNK_SIZE) + 1} of {Math.ceil(fullText.length / CHUNK_SIZE)}
          </Text>
          <TouchableOpacity style={styles.pageBtn} onPress={handlePrev} disabled={startIndex === 0}>
            <Text style={styles.navArrow}>&lt;</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pageBtn} onPress={handleNext} disabled={endIndex >= fullText.length}>
            <Text style={styles.navArrow}>&gt;</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.readerBox}>
        <Text style={styles.readerText}>
          <Text>{before}</Text>
          <Text style={styles.highlight}>{highlighted}</Text>
          <Text>{after}</Text>
        </Text>
      </ScrollView>
      <Text style={styles.note}>Only highlighted characters are synced to the display</Text>

      <Text style={styles.previewLabel}>Preview</Text>
      <View style={styles.previewBox}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {convertTextToBrailleDots(highlighted)
            .split(" ")
            .map((dots, index) => (
              <BrailleLetter key={index} dots={dots} />
            ))}
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
          <Text style={styles.syncText}>🔄 SYNC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
          <Text style={styles.endText}>🛑 END SESSION</Text>
        </TouchableOpacity>
      </View>

      <DisconnectionModal visible={isDisconnected} onClose={() => setIsDisconnected(false)} />
      <SessionSummaryModal
        visible={showSummary}
        sessionData={sessionData}
        onProceed={() => {
          setShowSummary(false);
          navigation.goBack();
        }}
      />

    </View>
  );
};

export default BookReadSessionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  bookTitle: {
    fontSize: width < 600 ? 18 : 20, // Responsive font size
    fontWeight: 'bold',
  },
  pageIndicator: {
    marginTop: 4,
    color: '#555',
  },
  pageNav: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  pageBtn: {
    padding: 6,
    marginHorizontal: 4,
    borderRadius: 11,
    backgroundColor: "#101734",
  },
  navArrow: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: "2%",
  },
  readerBox: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 200,
  },
  readerText: {
    fontSize: width < 600 ? 12 : 14, // Responsive font size
    lineHeight: 22,
  },
  highlight: {
    backgroundColor: '#ffcccc',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 10,
    marginLeft: 16,
    fontStyle: 'italic',
    color: '#666',
  },
  previewLabel: {
    marginLeft: 16,
    marginTop: 12,
    fontWeight: 'bold',
  },
  previewBox: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  brailleDots: {
    fontSize: 24,
  },
  actions: {
    flexDirection: 'row',
    margin: 16,
    justifyContent: 'space-between',
  },
  syncButton: {
    backgroundColor: 'orange',
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: 'red',
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  syncText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  endText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
