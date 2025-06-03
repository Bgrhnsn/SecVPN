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
};

type PrivacyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Privacy'
>;

interface Props {
  navigation: PrivacyScreenNavigationProp;
}

const PrivacyPolicyScreen = ({navigation}: Props) => {
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
          <Text style={styles.title}>Privacy Policy</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Collection</Text>
            <Text style={styles.text}>
              We collect minimal data necessary to provide our VPN service. This includes:
              {'\n'}- Connection timestamps
              {'\n'}- Server load statistics
              {'\n'}- Bandwidth usage
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>No-Logs Policy</Text>
            <Text style={styles.text}>
              We maintain a strict no-logs policy. We do not track:
              {'\n'}- Browsing history
              {'\n'}- Traffic destination
              {'\n'}- Data content
              {'\n'}- IP addresses
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.text}>
              Your security is our priority. We implement:
              {'\n'}- AES-256 encryption
              {'\n'}- Perfect forward secrecy
              {'\n'}- Secure VPN protocols
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

export default PrivacyPolicyScreen;
