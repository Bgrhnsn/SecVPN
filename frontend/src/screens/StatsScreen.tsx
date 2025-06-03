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
  Server: undefined;
  Settings: undefined;
  Privacy: undefined;
  Terms: undefined;
  Stats: undefined;
};

type StatsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Stats'
>;

interface Props {
  navigation: StatsScreenNavigationProp;
}

const StatsScreen = ({navigation}: Props) => {
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
          <Text style={styles.title}>Traffic Stats</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Today's Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Usage</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>2.4 GB</Text>
                <Text style={styles.statLabel}>Downloaded</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>1.1 GB</Text>
                <Text style={styles.statLabel}>Uploaded</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>3.5 GB</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>

          {/* Connection History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connection History</Text>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyServer}>🇺🇸 US Server #{i}</Text>
                  <Text style={styles.historyTime}>2 hours ago</Text>
                </View>
                <View>
                  <Text style={styles.historyDuration}>45 minutes</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Monthly Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Summary</Text>
            <View style={styles.monthlyStats}>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyLabel}>Total Data</Text>
                <Text style={styles.monthlyValue}>45.8 GB</Text>
              </View>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyLabel}>Connected Time</Text>
                <Text style={styles.monthlyValue}>52 hours</Text>
              </View>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyLabel}>Servers Used</Text>
                <Text style={styles.monthlyValue}>8</Text>
              </View>
            </View>
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  statLabel: {
    color: '#808080',
    fontSize: 14,
  },
  historyItem: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyServer: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 4,
  },
  historyTime: {
    color: '#808080',
    fontSize: 14,
  },
  historyDuration: {
    color: '#4CAF50',
    fontSize: 16,
  },
  monthlyStats: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 12,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  monthlyLabel: {
    color: '#808080',
    fontSize: 16,
  },
  monthlyValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StatsScreen;
