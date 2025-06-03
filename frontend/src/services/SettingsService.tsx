import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ayarlar için tip tanımı
export interface VpnSettings {
  autoConnect: boolean;  // Cihaz başladığında VPN'e otomatik bağlan
  killSwitch: boolean;   // VPN bağlantısı kesildiğinde internet erişimini engelle
  splitTunneling: boolean; // Belirli uygulamaların VPN'i bypass etmesine izin ver
}

// Context için tip tanımı
interface SettingsContextType {
  settings: VpnSettings;
  updateSettings: (newSettings: Partial<VpnSettings>) => Promise<void>;
  isLoading: boolean;
}

// Varsayılan ayarlar
const DEFAULT_SETTINGS: VpnSettings = {
  autoConnect: false,
  killSwitch: false,
  splitTunneling: false
};

// Settings context
const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  isLoading: true
});

// Context hook
export const useSettings = () => useContext(SettingsContext);

// Storage key
const SETTINGS_STORAGE_KEY = '@vpn_settings';

// Provider component
export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<VpnSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Ayarları AsyncStorage'dan yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Ayarlar yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Ayarları güncelle
  const updateSettings = async (newSettings: Partial<VpnSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      console.log('Ayarlar güncellendi:', updatedSettings);
    } catch (error) {
      console.error('Ayarlar güncellenemedi:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}; 