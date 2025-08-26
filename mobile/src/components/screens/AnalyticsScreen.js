import React, { useMemo, useRef, useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import ViewShot from 'react-native-view-shot';
import CustomHeader from '../ui/CustomHeader';
import axios from 'axios'
import { AuthContext } from '../../context/AuthContext';


const { width } = Dimensions.get('window');

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [BOOKS_DATA, setBooks] = useState([])
  const chartRef = useRef();
  const { state, setState } = useContext(AuthContext);


  useEffect(() => {
    axios.get(`https://brailliantweb.onrender.com/api/allbooks`)
      .then((response) => {
        setBooks(response.data.books)
      })
      .catch((error) => {
        console.log("eto ang error mo " + error)
      })
  }, [])


  //store top books, pie chart data, and total access count
  const { topBooks, pieData, totalAccess } = useMemo(() => {
    const sorted = [...BOOKS_DATA].sort((a, b) => b.book_count - a.book_count);
    const top = sorted.slice(0, 3);
    const total = sorted.reduce((sum, b) => sum + b.book_count, 0);

    const topFive = sorted.slice(0, 5);
    const othersCount = sorted.slice(5).reduce((sum, b) => sum + b.book_count, 0);

    const pieTopFive = [
      ...topFive.map(book => ({
        name: book.book_title,
        population: book.book_count,
        color: book.color,
        legendFontColor: '#000',
        legendFontSize: 12,
      })),
      ...(othersCount > 0
        ? [{
          name: 'Others',
          population: othersCount,
          color: '#CCCCCC',
          legendFontColor: '#000',
          legendFontSize: 12,
        }]
        : []),
    ];

    return { topBooks: top, pieData: pieTopFive, totalAccess: total };
  }, [BOOKS_DATA]);

  // Generate PDF report
  const generatePdf = async () => {
    setLoading(true);
    try {
      // Capture the pie chart as image
      const chartUri = await chartRef.current.capture();

      const htmlContent = `
        <h1>Analytics Report</h1>
        <h2>All Books (Sorted from most accessed)</h2>
        <ul>
          ${BOOKS_DATA.map(book => `<li>${book.book_title} — Access Count: ${book.book_count}</li>`).join('')}
        </ul>
        <p>Total Accesses: ${totalAccess}</p>
        <h3>Book Access Distribution</h3>
        <img src="${chartUri}" style="width:100%;height:auto;" />
      `;

      const pdf = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'analytics_report',
        base64: false,
        directory: 'Downloads'
      });

      Alert.alert('Success', `PDF generated at:\n${pdf.filePath}`);
    } catch (error) {
      Alert.alert('Error', `Failed to generate PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomHeader title="Analytics" onBack={() => navigation.goBack()} image={state.user.user_img} />
      <ScrollView style={styles.container}>
        <View style={styles.contentWrapper}>

          {/* Top Books */}
          <Text style={styles.sectionTitle}>Top Books</Text>
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

          {/* Pie Chart */}
          <Text style={styles.sectionTitle}>Book Access Count</Text>
          <View style={styles.chartWrapper}>
            <ViewShot ref={chartRef} options={{ format: 'png', quality: 0.9 }}>
              <PieChart
                data={pieData}
                width={width - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="10"
                center={[0, 0]}
                absolute
              />
            </ViewShot>
          </View>

          {/* Total Access */}
          <Text style={styles.totalAccess}>Total Accesses: {totalAccess}</Text>

          {/* Download PDF Button */}
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={generatePdf}
            disabled={loading}
          >
            <Text style={styles.downloadButtonText}>
              {loading ? 'Generating PDF...' : 'Download Full Report as PDF'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  contentWrapper: { padding: 16 },
  sectionTitle: { fontSize: width < 600 ? 20 : 24, fontWeight: 'bold', marginVertical: 10 },
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
  chartWrapper: { marginTop: 10, backgroundColor: '#fff', borderRadius: 10, padding: 10, elevation: 2 },
  totalAccess: { marginTop: 12, fontWeight: '500', fontSize: 14 },
  downloadButton: {
    marginTop: 20,
    backgroundColor: '#FFA500',
    padding: 14,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default AnalyticsScreen;
