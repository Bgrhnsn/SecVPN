import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SERVERS, useServer, Server } from '../services/ServerService';

type RootStackParamList = {
  Home: undefined;
  Server: undefined;
};

type ServerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Server'>;

interface Props {
  navigation: ServerScreenNavigationProp;
}

const ServerScreen = ({ navigation }: Props) => {
  const { selectedServer, setSelectedServer } = useServer();

  // Sunucu seçimi
  const handleServerSelect = (server: Server) => {
    // Sunucuyu kaydet
    setSelectedServer(server);
    
    // Gerçekte hangi sunucuya bağlanıldığını göster (Debug amaçlı)
    console.log(`Sunucu seçildi: ${server.country} (${server.isVirtual ? 'Sanal' : 'Gerçek'})`);
    
    // Ana ekrana geri dön
    navigation.navigate('Home');
  };

  const renderServer = ({ item }: { item: Server }) => (
    <TouchableOpacity 
      style={[
        styles.serverItem, 
        selectedServer.id === item.id ? styles.selectedServer : null
      ]}
      onPress={() => handleServerSelect(item)}>
      <View style={styles.serverInfo}>
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={styles.country}>{item.country}</Text>
      </View>
      <View style={styles.pingContainer}>
        {item.isVirtual ? (
          <Text style={styles.virtualBadge}>Visual</Text>
        ) : (
          <Text style={styles.realBadge}>Real</Text>
        )}
        <Text style={styles.ping}>{item.ping}ms</Text>
      </View>
    </TouchableOpacity>
  );

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
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Server</Text>
        </View>

        <FlatList
          data={SERVERS}
          renderItem={renderServer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Seçtiğiniz ülke görsel olarak gösterilir, ancak bağlantı tek bir merkezi sunucuya yapılır.
          </Text>
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  serverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 10,
  },
  selectedServer: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  country: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  pingContainer: {
    alignItems: 'flex-end',
  },
  ping: {
    fontSize: 14,
    color: '#808080',
    marginTop: 4,
  },
  virtualBadge: {
    fontSize: 12,
    color: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  realBadge: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 24,
  },
  infoBox: {
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  infoText: {
    color: '#808080',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ServerScreen;
