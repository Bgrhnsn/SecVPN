import notifee, { AndroidImportance, AndroidStyle, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ID del canal para notificaciones VPN
const VPN_CHANNEL_ID = 'vpn-connection-channel';

// ID de la notificación
const VPN_NOTIFICATION_ID = 'vpn-status';

// Clave para almacenamiento de acción pendiente
const PENDING_DISCONNECT_KEY = 'vpn_pending_disconnect';

// Almacenar callback de desconexión VPN
let vpnDisconnectCallback: (() => void) | null = null;

// Boş bildirim servisi (devre dışı bırakılmış)
const configureNotifications = async () => {
  console.log('Bildirim servisi devre dışı bırakıldı');
  return false;
};

// Boş check işlevi
const checkPendingActions = async () => {
  return false;
};

// Bildirim gösterme işlevi (işlevsiz)
const showVpnStatusNotification = async (isConnected: boolean, onDisconnectPressed: () => void) => {
  // Bildirimler devre dışı bırakıldığı için hiçbir şey yapmıyoruz
  console.log('Bildirim gösterimi devre dışı');
};

// Bildirim gizleme işlevi (işlevsiz)
const hideVpnStatusNotification = async () => {
  // Bildirimler devre dışı bırakıldığı için hiçbir şey yapmıyoruz
};

// Boş callback fonksiyonu
const getVpnDisconnectCallback = () => null;

// iOS kategorileri ayarlama işlevi (işlevsiz)
const setupIOSCategories = async () => {
  // Bildirimler devre dışı bırakıldığı için hiçbir şey yapmıyoruz
};

export default {
  configureNotifications,
  showVpnStatusNotification,
  hideVpnStatusNotification,
  getVpnDisconnectCallback,
  checkPendingActions,
  setupIOSCategories,
}; 