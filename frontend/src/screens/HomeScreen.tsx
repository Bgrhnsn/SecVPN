import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import authService from '../services/authService';
import vpnService, { VpnStatus } from '../services/vpnService';
import { SERVERS } from '../services/ServerService';
import { useVpn } from '../services/VpnService.tsx';
import { useNetworkStats } from '../services/NetworkService';

type RootStackParamList = {
  Home: undefined;
  Server: undefined;
  Settings: undefined; 
  Stats: undefined;
  Profile: undefined;
  Security: undefined;
  Notifications: undefined;
  Login: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen = ({ navigation }: Props) => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedServer, setSelectedServer] = useState({
    country: 'United States',
    flag: '🇺🇸'
  });
  const [securityStatus, setSecurityStatus] = useState<'secure' | 'insecure' | 'checking'>('checking');
  const [vpnStatus, setVpnStatus] = useState<VpnStatus | null>(null);
  const [connecting, setConnecting] = useState(false);
  
  // VPN bağlantısını kontrol etmek için useVpn hook'unu kullan
  const { vpnState, startVpn, stopVpn } = useVpn();
  
  // NetworkService ile gerçek ağ istatistiklerini al
  const networkStats = useNetworkStats(isConnected);
  
  // Animated value for rotation
  const spinValue = new Animated.Value(0);
  
  // VPN durumu değiştiğinde isConnected durumunu güncelle
  useEffect(() => {
    console.log('VPN state changed:', vpnState);
    const connected = vpnState === 'CONNECTED';
    setIsConnected(connected);
    
    if (connected) {
      setSecurityStatus('secure');
    } else if (vpnState === 'DISCONNECTED') {
      setSecurityStatus('insecure');
    }
    
    // Connecting veya Disconnecting durumlarını takip et
    setConnecting(vpnState === 'CONNECTING' || vpnState === 'DISCONNECTING');
  }, [vpnState]);
  
  // Start the animation when connecting changes
  useEffect(() => {
    if (connecting) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [connecting]);
  
  // Interpolate the value for rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    loadVpnStatus();
    checkSecurity();
    
    // Belirli aralıklarla VPN durumunu yenile
    const statusInterval = setInterval(() => {
      loadVpnStatus();
    }, 5000);
    
    return () => clearInterval(statusInterval);
  }, [isConnected]);

  const checkSecurity = async () => {
    try {
      setSecurityStatus('checking');
      
      // VPN bağlantı durumunu kontrolü
      if (vpnState === 'CONNECTED') {
        setSecurityStatus('secure');
        return;
      }
      
      setSecurityStatus('insecure');
    } catch (error) {
      console.error('Security check failed:', error);
      setSecurityStatus('insecure');
    }
  };

  const loadVpnStatus = async () => {
    try {
      const status = await vpnService.getStatus();
      setVpnStatus(status);
      
      // VPN durumu güncellendiğinde UI'yi güncelle, 
      // ama isConnected durumu zaten vpnState hook'undan güncelleniyor
      
      if (status.server) {
        // Sunucu bilgilerini güncelle
        setSelectedServer({
          country: status.server.location.split(',')[1]?.trim() || 'Unknown',
          flag: getCountryFlag(status.server.location) || '🌐'
        });
      }
    } catch (error) {
      console.error('Error loading VPN status:', error);
    }
  };

  const getCountryFlag = (location: string) => {
    const country = location.split(',')[1]?.trim()?.toLowerCase();
    if (!country) return '🌐';
    
    // Basit ülke bayrağı eşleşmeleri
    const flags: {[key: string]: string} = {
      'united states': '🇺🇸',
      'germany': '🇩🇪',
      'netherlands': '🇳🇱',
      'japan': '🇯🇵',
      'singapore': '🇸🇬',
      'france': '🇫🇷',
      'united kingdom': '🇬🇧',
      'canada': '🇨🇦',
      'australia': '🇦🇺',
      'turkey': '🇹🇷'
    };
    
    return flags[country] || '🌐';
  };

  const handleConnection = async () => {
    if (isConnected) {
      // Bağlantıyı kes
      try {
        setConnecting(true);
        await stopVpn();  // VPN Provider hook üzerinden bağlantıyı kes
      } catch (error) {
        console.error('Disconnection error:', error);
        Alert.alert('Connection Error', 'Failed to disconnect from VPN. Please try again.');
        setConnecting(false);
      }
    } else {
      // Bağlantı kur
      try {
        setConnecting(true);
        await startVpn();  // VPN Provider hook üzerinden bağlantıyı başlat
      } catch (error) {
        console.error('Connection error:', error);
        Alert.alert('Connection Error', 'Failed to connect to VPN. Please try again.');
        setConnecting(false);
      }
    }
  };

  // Çıkış yapma
  const handleLogout = async () => {
    try {
      // Eğer VPN bağlantısı varsa, önce onu kes
      if (isConnected) {
        await stopVpn();
      }
      
      await authService.logout();
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Render the connection animation
  const renderConnectionAnimation = () => {
    if (!connecting) return null;
    
    return (
      <View style={styles.connectionAnimationContainer}>
        <View style={styles.connectionAnimationBackground}>
          <Animated.View 
            style={[
              styles.connectionAnimation, 
              { transform: [{ rotate: spin }] }
            ]}
          >
            <View style={styles.connectionAnimationInner} />
          </Animated.View>
          <Text style={styles.connectionAnimationText}>
            {vpnState === 'CONNECTING' ? 'Connecting...' : 'Disconnecting...'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={true}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}>
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
          <Text style={styles.title}>SecVPN</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications' as never)}>
            <Text style={styles.notificationButtonText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings' as never)}>
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusIndicator, 
              isConnected ? styles.connected : (connecting ? styles.connecting : styles.disconnected)
            ]}
          >
            {connecting && (
              <>
                <Animated.View 
                  style={[
                    styles.innerConnectionAnimation,
                    { transform: [{ rotate: spin }] }
                  ]}
                />
                {/* Inner connection dot indicator */}
                <View style={styles.connectingInnerCircle}>
                  <View style={styles.connectingDot} />
                </View>
              </>
            )}
          </View>
          <Text style={styles.statusText}>
            {vpnState === 'CONNECTING' ? 'Connecting...' : 
             vpnState === 'DISCONNECTING' ? 'Disconnecting...' :
             vpnState === 'CONNECTED' ? 'Connected' : 'Not Connected'}
          </Text>
        </View>

        {/* Server Selection */}
        <TouchableOpacity 
          style={styles.serverButton}
          onPress={() => navigation.navigate('Server' as never)}>
          <Text style={styles.serverButtonText}>🌍 Select Server</Text>
          <Text style={styles.selectedServer}>
            {vpnStatus?.connected && vpnStatus.server 
              ? vpnStatus.server.location
              : `${selectedServer.flag} ${selectedServer.country}`}
          </Text>
        </TouchableOpacity>

        {/* Connect Button */}
        <TouchableOpacity
          style={[styles.connectButton, isConnected ? styles.disconnectButton : styles.connectButton]}
          onPress={handleConnection}
          disabled={connecting}>
          {connecting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.connectButtonText}>
              {isConnected ? 'Disconnect' : 'Connect'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Security Status Button */}
        <TouchableOpacity 
          style={[
            styles.securityButton,
            securityStatus === 'secure' ? styles.secureButton : styles.insecureButton
          ]}
          onPress={() => navigation.navigate('Security' as never)}>
          <View style={styles.securityContent}>
            <View>
              <Text style={styles.securityTitle}>Security Check</Text>
              <Text style={[
                styles.securityStatus,
                securityStatus === 'secure' ? styles.secureText : styles.insecureText
              ]}>
                {securityStatus === 'checking' ? 'Checking security...' :
                 securityStatus === 'secure' ? 'Connection is secure' :
                 'Security issues detected'}
              </Text>
            </View>
            <Text style={styles.securityArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Connection Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Download</Text>
              <Text style={styles.statValue}>
                {isConnected ? 
                  (networkStats.isLoading ? 'Measuring...' : networkStats.downloadSpeed) : 
                  '--'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Upload</Text>
              <Text style={styles.statValue}>
                {isConnected ? 
                  (networkStats.isLoading ? 'Measuring...' : networkStats.uploadSpeed) : 
                  '--'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ping</Text>
              <Text style={styles.statValue}>
                {isConnected ? 
                  (networkStats.isLoading ? 'Measuring...' : networkStats.ping) : 
                  '--'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.statsButton}
            onPress={() => navigation.navigate('Stats' as never)}>
            <Text style={styles.statsButtonText}>View Details</Text>
            <Text style={styles.statsArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statusIndicator: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  connected: {
    borderWidth: 15,
    borderColor: '#4CAF50',
  },
  disconnected: {
    borderWidth: 15,
    borderColor: '#f44336',
  },
  connecting: {
    borderWidth: 0,
    backgroundColor: '#1a1a1a',
  },
  statusText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  vpnStateText: {
    fontSize: 14,
    color: '#aaaaaa',
    marginTop: 5,
  },
  serverButton: {
    backgroundColor: '#2a2a2a',
    margin: 20,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  serverButtonText: {
    color: '#808080',
    fontSize: 16,
  },
  selectedServer: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    paddingBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#808080',
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  statsButton: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsButtonText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  statsArrow: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '600',
  },
  profileButton: {
    position: 'absolute',
    left: 20,
  },
  profileButtonText: {
    fontSize: 24,
  },
  securityButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
  },
  secureButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  insecureButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  securityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#ffffff',
  },
  securityStatus: {
    fontSize: 14,
  },
  secureText: {
    color: '#4CAF50',
  },
  insecureText: {
    color: '#f44336',
  },
  securityArrow: {
    color: '#808080',
    fontSize: 20,
  },
  notificationButton: {
    position: 'absolute',
    right: 60, // settingsButton'dan önce
  },
  notificationButtonText: {
    fontSize: 24,
  },
  innerConnectionAnimation: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 15,
    borderColor: '#FFC107',
    borderTopColor: 'transparent',
  },
  connectingInnerCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  connectingDot: {
    width: 14,
    height: 14,
    borderRadius: 7, 
    backgroundColor: '#4CAF50',
  },
  // Connection Animation Styles (keeping but not using - will be removed in future)
  connectionAnimationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
    display: 'none', // Hide the overlay
  },
  connectionAnimationBackground: {
    width: 120,
    height: 120,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectionAnimation: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderTopColor: 'transparent',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionAnimationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  connectionAnimationText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default HomeScreen;
