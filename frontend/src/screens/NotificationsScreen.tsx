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
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Notifications: undefined;
};

type NotificationsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Notifications'
>;

interface Props {
  navigation: NotificationsScreenNavigationProp;
}

// Örnek bildirim datası
const notifications = [
  {
    id: '1',
    type: 'security',
    title: 'Security Alert',
    message: 'Unusual traffic detected from your device',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'system',
    title: 'System Update',
    message: 'New VPN servers added in Singapore',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: '3',
    type: 'security',
    title: 'Connection Warning',
    message: 'VPN connection dropped unexpectedly',
    timestamp: '2 days ago',
    read: true,
  },
];

const NotificationsScreen = ({navigation}: Props) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'security':
        return '🔒';
      case 'system':
        return '⚙️';
      default:
        return '📌';
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
          <Text style={styles.title}>Notifications</Text>
        </View>

        <ScrollView style={styles.content}>
          {notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard,
              ]}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationTitleContainer}>
                  <Text style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </Text>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                </View>
                <Text style={styles.timestamp}>{notification.timestamp}</Text>
              </View>
              <Text style={styles.message}>{notification.message}</Text>
              {!notification.read && (
                <View style={styles.unreadDot} />
              )}
            </TouchableOpacity>
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
  notificationCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: '#2d3436',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  notificationTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: '#808080',
    fontSize: 12,
  },
  message: {
    color: '#D3D3D3',
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
});

export default NotificationsScreen;
