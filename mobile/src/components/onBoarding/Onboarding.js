import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import slides from './slides';
import Onboardingitem from './Onboardingitem';
import Paginator from './Paginator';
import NextButton from './NextButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Onboarding = () => {
  const navigation = useNavigation();
  const [buttonText, setButtonText] = useState("Continue");
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  useEffect(() => {
    setButtonText(currentIndex === slides.length - 1 ? "Get Started" : "Continue");
  }, [currentIndex]);

  const scrollTo = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      try {
        await AsyncStorage.setItem('@viewedOnBoarding', 'true');
        navigation.replace('Login');
      } catch (err) {
        console.log("Error @setItem:", err);
      }
    }
  };

  const handleSkip = async () => {
    slidesRef.current.scrollToIndex({ index: slides.length - 1 });
  };

  return (
    <LinearGradient colors={['#ffffff', '#76c7f2']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.skipContainer}>
          {currentIndex < slides.length - 1 && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Skip &gt;</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sliderContainer}>
          {/** 
           * 
           * <FlatList
            data={slides}
            renderItem={({ item }) => <Onboardingitem item={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={item => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={32}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            ref={slidesRef}
          />
          */}
          <FlatList
            data={slides}
            renderItem={({ item }) => <Onboardingitem item={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={item => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={32}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            ref={slidesRef}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />

        </View>

        <Paginator data={slides} scrollX={scrollX} />
        <NextButton scrollTo={scrollTo} buttonText={buttonText} />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 20 : 10,
  },
  skipContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: width < 600 ? 14 : 16, // Responsive font size
    color: '#000',
    fontWeight: '500',
  },
  sliderContainer: {
    flex: 3,
    justifyContent: 'center',
  },
});
