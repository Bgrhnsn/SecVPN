import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Profile: undefined;
  Plan: undefined;
  Home: undefined;
  PaymentSuccess: undefined;
};

type PlanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Plan'>;

interface Props {
  navigation: PlanScreenNavigationProp;
}

const plans = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '$0/month',
    features: [
      { text: 'Basic VPN Protection', available: true },
      { text: '5 Server Locations', available: true },
      { text: '10GB Monthly Data', available: true },
      { text: 'Premium Servers', available: false },
      { text: 'Unlimited Data', available: false },
      { text: 'Priority Support', available: false },
      { text: 'Ad Blocker', available: false },
      { text: 'Multi-Device Support', available: false },
    ],
    current: true,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$9.99/month',
    features: [
      { text: 'Advanced VPN Protection', available: true },
      { text: '50+ Server Locations', available: true },
      { text: 'Unlimited Data', available: true },
      { text: 'Premium High-Speed Servers', available: true },
      { text: 'Priority 24/7 Support', available: true },
      { text: 'Built-in Ad Blocker', available: true },
      { text: 'Use on up to 5 Devices', available: true },
      { text: 'Smart DNS Feature', available: true },
    ],
    current: false,
  },
];

const PlanScreen = ({navigation}: Props) => {
  const handleUpgrade = (planId: string) => {
    // Ödeme işlemleri başarılı olduktan sonra
    Alert.alert(
      'Success',
      'Your plan has been upgraded successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Profile'),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={true} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <View style={styles.backButtonContainer}>
              <Text style={styles.backButtonIcon}>←</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Choose Plan</Text>
        </View>

        <ScrollView style={styles.content}>
          {plans.map(plan => (
            <View key={plan.id} style={[styles.planCard, plan.id === 'pro' && styles.proPlanCard]}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={[
                      styles.featureText,
                      !feature.available && styles.featureUnavailable
                    ]}>
                      {feature.available ? '✓' : '×'} {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {!plan.current && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => handleUpgrade(plan.id)}>
                  <Text style={styles.upgradeButtonText}>
                    Upgrade to {plan.name}
                  </Text>
                </TouchableOpacity>
              )}

              {plan.current && (
                <View style={styles.currentPlanBadge}>
                  <Text style={styles.currentPlanText}>Current Plan</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
  },
  backButtonContainer: {
    backgroundColor: '#2a2a2a',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  backButtonIcon: {
    color: '#4CAF50',
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  planCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  proPlanCard: {
    backgroundColor: '#1e3c2f',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  planHeader: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 20,
    color: '#4CAF50',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    color: '#ffffff',
    fontSize: 16,
  },
  featureUnavailable: {
    color: '#808080',
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentPlanBadge: {
    backgroundColor: '#808080',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanText: {
    color: '#ffffff',
    fontSize: 14,
  },
});

export default PlanScreen;
