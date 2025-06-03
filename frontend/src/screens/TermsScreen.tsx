import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Server: undefined;
  Settings: undefined;
  Privacy: undefined;
  Terms: undefined;
};

type TermsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Terms'
>;

interface Props {
  navigation: TermsScreenNavigationProp;
}

const TermsScreen = ({navigation}: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={true}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <View style={styles.backButtonContainer}>
              <Text style={styles.backButtonIcon}>←</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Terms of Service</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Service Usage</Text>
            <Text style={styles.text}>
              By using our VPN service, you agree to:
              {'\n'}- Not use the service for illegal activities
              {'\n'}- Not attempt to breach or circumvent our security
              {'\n'}- Not resell or redistribute the service
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Account Responsibilities</Text>
            <Text style={styles.text}>
              You are responsible for:
              {'\n'}- Maintaining account security
              {'\n'}- All activities under your account
              {'\n'}- Complying with local laws and regulations
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Service Limitations</Text>
            <Text style={styles.text}>
              We reserve the right to:
              {'\n'}- Modify service features
              {'\n'}- Update pricing and plans
              {'\n'}- Terminate accounts violating terms
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Warranty</Text>
            <Text style={styles.text}>
              The service is provided "as is" without warranties of:
              {'\n'}- Uninterrupted service
              {'\n'}- Specific speeds or latency
              {'\n'}- Compatibility with all devices
            </Text>
          </View>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
  },
});

export default TermsScreen;
