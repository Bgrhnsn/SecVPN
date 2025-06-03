import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import RNSimpleOpenvpn, {
  addVpnStateListener,
  removeVpnStateListener,
} from 'react-native-simple-openvpn';
import { useSettings } from './SettingsService';
import { REAL_SERVER } from './ServerService';
import NotificationService from './NotificationService';

const isIPhone = Platform.OS === 'ios';

// VPN bağlantı seçenekleri için tipi
interface VpnOptions {
  remoteAddress: string;
  ovpnFileName: string;
  assetsPath: string;
  providerBundleIdentifier?: string;
  localizedDescription?: string;
}

// VPN durumu için özel tip tanımı
type VpnState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | string;

// Sayısal VPN durumlarını string değerlere dönüştürmek için
const mapVpnState = (state: string | number): VpnState => {
  switch (state) {
    case 0:
    case '0':
      return 'DISCONNECTED';
    case 1:
    case '1':
      return 'CONNECTING';
    case 2:
    case '2':
      return 'CONNECTED';
    case 3:
    case '3':
      return 'DISCONNECTING';
    default:
      return String(state);
  }
};

// VPN bağlantı durumu ve fonksiyonları için context
interface VpnContextType {
  vpnState: VpnState;
  startVpn: () => Promise<void>;
  stopVpn: () => Promise<void>;
}

const VpnContext = createContext<VpnContextType>({
  vpnState: 'DISCONNECTED',
  startVpn: async () => {},
  stopVpn: async () => {},
});

export const useVpn = () => useContext(VpnContext);

export const VpnProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [vpnState, setVpnState] = useState<VpnState>('DISCONNECTED');
  const listenerId = useRef<string | null>(null);
  const appState = useRef(AppState.currentState);
  const { settings } = useSettings();

  // Initialize notification service
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Inicializar notificaciones
        await NotificationService.configureNotifications();
        
        // Para iOS, configurar categorías adicionales
        await NotificationService.setupIOSCategories();
        
        // Verificar acciones pendientes - por ejemplo, si el usuario presionó "Desconectar" mientras la app estaba en segundo plano
        const hasPendingDisconnect = await NotificationService.checkPendingActions();
        if (hasPendingDisconnect && vpnState === 'CONNECTED') {
          // Ejecutar la desconexión si estaba pendiente
          stopVpn();
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };
    
    // Iniciar notificaciones
    initNotifications();

    return () => {
      // Ocultar notificaciones al desmontar el componente
      NotificationService.hideVpnStatusNotification();
    };
  }, []);

  // Update notification when VPN state changes
  useEffect(() => {
    const updateNotifications = async () => {
      try {
        if (vpnState === 'CONNECTED') {
          // Mostrar notificación permanente de conexión activa
          await NotificationService.showVpnStatusNotification(true, stopVpn);
        } else if (vpnState === 'DISCONNECTED') {
          // Mostrar notificación temporal de desconexión
          await NotificationService.showVpnStatusNotification(false, () => {});
        }
      } catch (error) {
        console.error('Error updating notifications:', error);
      }
    };
    
    updateNotifications();
  }, [vpnState]);

  // VPN bağlantı durumunu izle
  useEffect(() => {
    (async () => {
      if (isIPhone) {
        // iOS'te arka planda sistem durumunu izler
        await RNSimpleOpenvpn.observeState();
      }

      // Dinleyici ekle → id'yi sakla
      const id = addVpnStateListener(e => {
        console.log("VPN durum değişikliği (ham):", e.state);
        const mappedState = mapVpnState(e.state);
        console.log("VPN durum değişikliği (map sonrası):", mappedState);
        setVpnState(mappedState);
      });
      
      if (typeof id === 'string') {
        listenerId.current = id;
      }
    })();

    return () => {
      // Temizle
      if (listenerId.current) {
        removeVpnStateListener();
      }
      if (isIPhone) {
        RNSimpleOpenvpn.stopObserveState().catch(() => {});
      }
    };
  }, []);

  // Auto Connect özelliği için uygulama durumunu izle
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Uygulama arka plandan ön plana geldiğinde
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('Uygulama ön plana geldi');
        
        // Auto Connect ayarı açıksa ve VPN bağlı değilse bağlan
        if (settings.autoConnect && vpnState !== 'CONNECTED' && vpnState !== 'CONNECTING') {
          console.log('Auto Connect: VPN otomatik bağlanıyor');
          startVpn();
        }
      }
      
      appState.current = nextAppState;
    };

    // AppState listener'ını ekle
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Uygulama başlatıldığında Auto Connect ayarı açıksa bağlan
    if (settings.autoConnect && vpnState !== 'CONNECTED') {
      console.log('Auto Connect: Uygulama başlatıldığında VPN bağlanıyor');
      startVpn();
    }

    return () => {
      subscription.remove();
    };
  }, [settings.autoConnect, vpnState]);

  const startVpn = async () => {
    try {
      console.log("VPN bağlantısı başlatılıyor...");
      // Durum güncellemesi
      setVpnState('CONNECTING');
      
      // Bağlantı seçeneklerini hazırla
      const connectOptions = {
        ...REAL_SERVER
      };
      
      // iOS için ekstra ayarlar
      if (isIPhone) {
        // iOS seçenekleri ekle
        await RNSimpleOpenvpn.connect({
          ...connectOptions,
          providerBundleIdentifier: 'com.example.RNSimpleOvpnTest.NEOpenVPN',
          localizedDescription: 'RNSimpleOvpn',
        } as any);
      } else {
        // Android için düz bağlantı - tip kontrolünü geçici olarak bastır
        await RNSimpleOpenvpn.connect(connectOptions as any);
      }
      
      console.log("VPN bağlantı isteği gönderildi - Gerçek sunucuya bağlanılıyor:", REAL_SERVER.remoteAddress);
      
    } catch (err) {
      console.warn('VPN connect error', err);
      // Hata durumunda disconnected durumuna geri dön
      setVpnState('DISCONNECTED');
    }
  };

  const stopVpn = async () => {
    try {
      console.log("VPN bağlantısı sonlandırılıyor...");
      // Durum güncellemesi
      setVpnState('DISCONNECTING');
      
      await RNSimpleOpenvpn.disconnect();
      console.log("VPN bağlantı kesme isteği gönderildi");
    } catch (err) {
      console.warn('VPN disconnect error', err);
      // Hata olsa bile disconnected olarak güncelle
      setVpnState('DISCONNECTED');
    }
  };

  return (
    <VpnContext.Provider value={{ vpnState, startVpn, stopVpn }}>
      {children}
    </VpnContext.Provider>
  );
}; 