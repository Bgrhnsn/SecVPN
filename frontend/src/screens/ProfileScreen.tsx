import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import authService, { User } from '../services/authService';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Login: undefined; // Login ekranına navigasyon için eklendi
  Plan: undefined; // Plan ekranı için eklendi
  Payment: undefined; // Payment ekranı için eklendi
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

interface UserPlanData {
  type: string;
  dataLimit: number; // GB
  dataUsed: number; // GB
  expiryDate: string;
  memberSince: string;
}

const ProfileScreen = ({navigation}: Props) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlanData>({
    type: 'Free Plan',
    dataLimit: 10, // GB
    dataUsed: 4.5, // GB
    expiryDate: '2024-03-31',
    memberSince: 'January 2024'
  });

  // Kullanıcı ve abonelik verilerini yükleme
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // AsyncStorage'dan kullanıcı verilerini al
        const storedUser = await authService.getStoredUser();
        
        if (storedUser) {
          setUserData(storedUser);
          
          // API'den güncel profil verilerini çekmeye çalış
          try {
            const profileData = await authService.getUserProfile();
            if (profileData) {
              setUserData(profileData);
            }
          } catch (error) {
            console.error('Error fetching profile from API:', error);
            // Sadece yerel verileri kullanmaya devam et
          }
          
          // TODO: Gerçek bir API'den plan verilerini çekmek için:
          // const planData = await planService.getUserPlan();
          // setUserPlan(planData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const calculateDataPercentage = () => {
    return (userPlan.dataUsed / userPlan.dataLimit) * 100;
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#1a1a1a"
          translucent={true}
        />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.title}>Profile</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Account Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData?.email || 'user@example.com'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{userPlan.memberSince}</Text>
              </View>
            </View>
          </View>

          {/* Subscription Plan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Plan</Text>
            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{userPlan.type}</Text>
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => navigation.navigate('Plan')}>
                  <Text style={styles.upgradeButtonText}>Upgrade</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.expiryDate}>Expires: {userPlan.expiryDate}</Text>
            </View>
          </View>

          {/* Data Usage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Usage</Text>
            <View style={styles.usageCard}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageText}>
                  {userPlan.dataUsed} GB of {userPlan.dataLimit} GB used
                </Text>
                <Text style={styles.usagePercent}>
                  {Math.round(calculateDataPercentage())}%
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${calculateDataPercentage()}%` }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity 
              style={styles.paymentCard}
              onPress={() => navigation.navigate('Payment')}>
              <Text style={styles.paymentText}>Add Payment Method</Text>
              <Text style={styles.paymentIcon}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#808080',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    color: '#808080',
    fontSize: 16,
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 16,
  },
  planCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  expiryDate: {
    color: '#808080',
    fontSize: 14,
  },
  usageCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  usageText: {
    color: '#ffffff',
    fontSize: 16,
  },
  usagePercent: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#3a3a3a',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  paymentCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  paymentIcon: {
    color: '#4CAF50',
    fontSize: 24,
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileScreen;
