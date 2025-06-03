import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Settings: undefined;
  Help: undefined;
};

type HelpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Help'>;

interface Props {
  navigation: HelpScreenNavigationProp;
}

interface FAQ {
  question: string;
  answer: string;
  isExpanded: boolean;
}

const HelpScreen = ({navigation}: Props) => {
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: 'How do I connect to VPN?',
      answer: 'Simply select a server from the server list and tap the connect button. The app will handle the rest automatically.',
      isExpanded: false,
    },
    {
      question: 'What is Kill Switch?',
      answer: 'Kill Switch is a safety feature that blocks all internet traffic if the VPN connection drops unexpectedly, protecting your privacy.',
      isExpanded: false,
    },
    {
      question: 'Why is my connection slow?',
      answer: 'Connection speed can be affected by server distance, server load, or your base internet speed. Try connecting to a closer server for better performance.',
      isExpanded: false,
    },
    {
      question: 'How do I change my subscription plan?',
      answer: 'Go to Profile > Current Plan and select "Upgrade" to view available plans and make changes to your subscription.',
      isExpanded: false,
    },
  ]);

  const toggleFAQ = (index: number) => {
    setFaqs(faqs.map((faq, i) => ({
      ...faq,
      isExpanded: i === index ? !faq.isExpanded : false
    })));
  };

  const handleEmailSupport = async () => {
    const supportEmail = 'support@secvpn.com';
    const subject = 'VPN Support Request';
    const body = 'Please describe your issue here:';
    
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Error', 'No email app found on your device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open email client');
    }
  };

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
          <Text style={styles.title}>Help & Support</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.supportSection}>
            <Text style={styles.sectionTitle}>Need Help?</Text>
            <View style={styles.supportCard}>
              <Text style={styles.supportTitle}>Contact Support</Text>
              <Text style={styles.supportDescription}>
                Our team is available 24/7 to help you with any issues
              </Text>
              <TouchableOpacity onPress={handleEmailSupport}>
                <Text style={styles.supportEmail}>support@secvpn.com</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleFAQ(index)}>
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text style={styles.faqIcon}>
                    {faq.isExpanded ? '−' : '+'}
                  </Text>
                </View>
                {faq.isExpanded && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
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
  sectionTitle: {
    fontSize: 18,
    color: '#808080',
    marginBottom: 15,
  },
  supportSection: {
    marginBottom: 30,
  },
  supportCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
  },
  supportTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  supportDescription: {
    color: '#808080',
    fontSize: 14,
    marginBottom: 15,
  },
  supportEmail: {
    color: '#4CAF50',
    fontSize: 16,
    textDecorationLine: 'underline', // Email'in tıklanabilir olduğunu belirtmek için
  },
  faqSection: {
    flex: 1,
  },
  faqItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
  },
  faqIcon: {
    color: '#4CAF50',
    fontSize: 24,
    marginLeft: 10,
  },
  faqAnswer: {
    color: '#808080',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
});

export default HelpScreen;
