import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Profile: undefined;
  Payment: undefined;
  Home: undefined;
  PaymentSuccess: undefined;
};

type PaymentScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Payment'
>;

interface Props {
  navigation: PaymentScreenNavigationProp;
}

const PaymentScreen = ({navigation}: Props) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const formatCardNumber = (text: string) => {
    return text.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpDate = (text: string) => {
    text = text.replace(/\D/g, '');
    if (text.length >= 2) {
      return `${text.slice(0, 2)}/${text.slice(2, 4)}`;
    }
    return text;
  };

  const handleAddCard = () => {
    // Burada Stripe veya başka bir ödeme sistemi entegrasyonu yapılacak
    Alert.alert(
      'Success',
      'Payment method added successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
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
          <Text style={styles.title}>Add Payment Method</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.cardContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="4242 4242 4242 4242"
                placeholderTextColor="#808080"
                keyboardType="numeric"
                maxLength={19}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#808080"
                  keyboardType="numeric"
                  maxLength={5}
                  value={expDate}
                  onChangeText={(text) => setExpDate(formatExpDate(text))}
                />
              </View>

              <View style={[styles.inputContainer, {flex: 1}]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#808080"
                  keyboardType="numeric"
                  maxLength={3}
                  value={cvv}
                  onChangeText={setCvv}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name on card"
                placeholderTextColor="#808080"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.secureNotice}>
            <Text style={styles.secureText}>
              🔒 Your payment information is secure and encrypted
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCard}>
            <Text style={styles.addButtonText}>Add Card</Text>
          </TouchableOpacity>
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
  cardContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#808080',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#363636',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secureNotice: {
    alignItems: 'center',
    marginVertical: 20,
  },
  secureText: {
    color: '#808080',
    fontSize: 14,
  },
});

export default PaymentScreen;
