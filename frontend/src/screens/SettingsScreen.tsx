import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { useSettings } from '../services/SettingsService';
import { useVpn } from '../services/VpnService.tsx';

type RootStackParamList = {
    Home: undefined;
    Server: undefined;
    Settings: undefined;
    Privacy: undefined;
    Terms:undefined;  // Bu satırı ekleyin.
    Help: undefined;
    Logs: undefined; // Developer logs screen
  };

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen = ({navigation}: Props) => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { vpnState } = useVpn();
  const [developerTaps, setDeveloperTaps] = useState(0);
  
  // Kill Switch özelliğini etkinleştir
  useEffect(() => {
    if (settings.killSwitch && vpnState !== 'CONNECTED' && vpnState !== 'CONNECTING') {
      // Gerçek uygulamada burada internet erişimini engelleyebilirsiniz
      console.log('Kill Switch aktiv: İnternet erişimi engellendi');
    }
  }, [settings.killSwitch, vpnState]);

  // Gizli geliştirici menüsü için
  const handleVersionTap = () => {
    const newTaps = developerTaps + 1;
    setDeveloperTaps(newTaps);
    
    if (newTaps === 5) {
      Alert.alert(
        '🔧 Developer Mode',
        'Access developer logs?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Logs', 
            onPress: () => {
              setDeveloperTaps(0);
              navigation.navigate('Logs' as any);
            }
          }
        ]
      );
    } else if (newTaps >= 10) {
      setDeveloperTaps(0);
    }
  };

  // Değişiklikleri yönet
  const handleAutoConnectToggle = async (value: boolean) => {
    await updateSettings({ autoConnect: value });
    if (value) {
      Alert.alert(
        'Auto Connect',
        'VPN will automatically connect when your device starts',
        [{ text: 'OK' }]
      );
    }
  };

  const handleKillSwitchToggle = async (value: boolean) => {
    await updateSettings({ killSwitch: value });
    if (value) {
      Alert.alert(
        'Kill Switch',
        'Your internet connection will be blocked when VPN is disconnected',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSplitTunnelingToggle = async (value: boolean) => {
    await updateSettings({ splitTunneling: value });
    if (value) {
      // Gelecekte uygulama seçimi ekranına yönlendirilebilir
      Alert.alert(
        'Split Tunneling',
        'Select apps that will bypass the VPN',
        [
          { text: 'Configure Later', style: 'cancel' },
          { text: 'Configure Now', onPress: () => console.log('Uygulama listesi gösterilecek') }
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={styles.loadingText}>Loading settings...</Text>
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
            onPress={() => navigation.navigate('Home')}>
            <View style={styles.backButtonContainer}>
              <Text style={styles.backButtonIcon}>←</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connection</Text>
            
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Auto Connect</Text>
                <Text style={styles.settingDescription}>
                  Connect VPN automatically when device starts
                </Text>
              </View>
              <Switch
                value={settings.autoConnect}
                onValueChange={handleAutoConnectToggle}
                trackColor={{false: '#767577', true: '#4CAF50'}}
              />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Kill Switch</Text>
                <Text style={styles.settingDescription}>
                  Block internet when VPN is disconnected
                </Text>
              </View>
              <Switch
                value={settings.killSwitch}
                onValueChange={handleKillSwitchToggle}
                trackColor={{false: '#767577', true: '#4CAF50'}}
              />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Split Tunneling</Text>
                <Text style={styles.settingDescription}>
                  Choose apps to bypass VPN
                </Text>
              </View>
              <Switch
                value={settings.splitTunneling}
                onValueChange={handleSplitTunnelingToggle}
                trackColor={{false: '#767577', true: '#4CAF50'}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Info</Text>
            <TouchableOpacity 
              style={styles.infoItem}
              onPress={handleVersionTap}>
              <Text style={styles.infoTitle}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.infoItem}
              onPress={() => navigation.navigate('Privacy')}>
              <Text style={styles.infoTitle}>Privacy Policy</Text>
              <Text style={styles.infoValue}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.infoItem}
              onPress={() => navigation.navigate('Terms')}>
              <Text style={styles.infoTitle}>Terms of Service</Text>
              <Text style={styles.infoValue}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.infoItem}
              onPress={() => navigation.navigate('Help')}>
              <Text style={styles.infoTitle}>Help & Support</Text>
              <Text style={styles.infoValue}>→</Text>
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
  backButtonLabel: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#808080',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#808080',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoTitle: {
    fontSize: 16,
    color: '#ffffff',
  },
  infoValue: {
    fontSize: 16,
    color: '#808080',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default SettingsScreen;
