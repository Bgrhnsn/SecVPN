import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
};

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  slide: {
    width,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: 'rgba(42, 42, 42, 0.3)',
    borderRadius: 20,
    marginHorizontal: 10,
    paddingVertical: 30,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  slideIcon: {
    fontSize: 80,
    marginBottom: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    width: 120,
    height: 120,
    textAlign: 'center',
    lineHeight: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  slideDescription: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4CAF50',
    width: 20,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#808080',
    fontSize: 16,
  },
  featuresContainer: {
    marginTop: 30,
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(42, 42, 42, 0.3)',
    borderRadius: 12,
    padding: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    color: '#4CAF50',
    fontSize: 18,
    marginRight: 10,
  },
  featureText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
});

const slides = [
  {
    id: '1',
    title: 'AI-Powered Security',
    description: 'Our advanced AI model continuously monitors your connection, analyzing IP ranges, TLS certificates, and server authenticity in real-time',
    icon: '🤖',
    features: [
      'Real-time security analysis',
      'CIDR block verification',
      'Certificate validation'
    ]
  },
  {
    id: '2',
    title: 'Secure Connection',
    description: 'Protect your privacy with military-grade encryption and secure VPN protocols',
    icon: '🔒',
    features: [
      'Military-grade encryption',
      'Secure VPN protocols',
      'No logs policy'
    ]
  },
  {
    id: '3',
    title: 'Global Access',
    description: 'Connect to servers worldwide and access content without restrictions',
    icon: '🌍',
    features: [
      'Worldwide server network',
      'Unrestricted access',
      'Optimized routing'
    ]
  },
  {
    id: '4',
    title: 'Lightning Speed',
    description: 'Experience high-speed connections with our optimized VPN network',
    icon: '⚡',
    features: [
      'High-speed servers',
      'Optimized protocols',
      'No bandwidth limits'
    ]
  },
];

const OnboardingScreen = ({navigation}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({index: currentIndex + 1});
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const flatListRef = React.useRef<FlatList>(null);

  const renderSlide = ({item}: {item: typeof slides[0]}) => (
    <View style={styles.slide}>
      <Text style={styles.slideIcon}>{item.icon}</Text>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
      
      <View style={styles.featuresContainer}>
        {item.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={true}
      />
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={event => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / width,
            );
            setCurrentIndex(newIndex);
          }}
        />

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>

          {currentIndex !== slides.length - 1 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.replace('Login')}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
