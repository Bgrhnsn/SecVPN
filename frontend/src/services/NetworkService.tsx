import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { NetworkInfo } from 'react-native-network-info';

export interface NetworkStats {
  downloadSpeed: string;
  uploadSpeed: string;
  ping: string;
  isLoading: boolean;
}

export const useNetworkStats = (isConnected: boolean): NetworkStats => {
  const [stats, setStats] = useState<NetworkStats>({
    downloadSpeed: '--',
    uploadSpeed: '--',
    ping: '--',
    isLoading: false
  });

  // Veri boyutu formatı (MB/s, KB/s)
  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond >= 1048576) { // 1 MB
      return `${(bytesPerSecond / 1048576).toFixed(1)} MB/s`;
    } else {
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    }
  };

  // Ping testi
  const measurePing = async (): Promise<number> => {
    try {
      const start = Date.now();
      await fetch('https://www.google.com', { method: 'HEAD' });
      const end = Date.now();
      return end - start;
    } catch (error) {
      console.error('Ping ölçümü hatası:', error);
      return 0;
    }
  };

  // İndirme hızı testi
  const measureDownloadSpeed = async (): Promise<number> => {
    try {
      const fileUrl = 'https://speed.cloudflare.com/cdn-cgi/trace'; // küçük test dosyası
      const start = Date.now();
      const response = await fetch(fileUrl);
      const data = await response.text();
      const end = Date.now();
      
      const fileSizeInBytes = data.length;
      const durationInSeconds = (end - start) / 1000;
      return fileSizeInBytes / durationInSeconds;
    } catch (error) {
      console.error('İndirme hızı ölçümü hatası:', error);
      return 0;
    }
  };

  // Yükleme hızı testi (basit simülasyon)
  const measureUploadSpeed = async (): Promise<number> => {
    try {
      // Gerçek bir POST işlemi ile değiştirebilirsiniz
      const sampleData = 'x'.repeat(10000); // 10KB veri
      const start = Date.now();
      await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: sampleData
      });
      const end = Date.now();
      
      const fileSizeInBytes = sampleData.length;
      const durationInSeconds = (end - start) / 1000;
      return fileSizeInBytes / durationInSeconds;
    } catch (error) {
      console.error('Yükleme hızı ölçümü hatası:', error);
      return 0;
    }
  };

  // IP adresi ve ağ türünü alma
  const getNetworkInfo = async () => {
    try {
      const ipAddress = await NetworkInfo.getIPV4Address();
      console.log('IP Adresi:', ipAddress);
      
      if (Platform.OS === 'android') {
        const ssid = await NetworkInfo.getSSID();
        console.log('SSID:', ssid);
      }
    } catch (error) {
      console.error('Ağ bilgileri alınamadı:', error);
    }
  };

  // Tüm ölçümleri birleştir
  const measureAll = async () => {
    if (!isConnected) {
      setStats({
        downloadSpeed: '--',
        uploadSpeed: '--',
        ping: '--',
        isLoading: false
      });
      return;
    }

    setStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      await getNetworkInfo();
      
      const pingValue = await measurePing();
      const downloadValue = await measureDownloadSpeed();
      const uploadValue = await measureUploadSpeed();
      
      setStats({
        downloadSpeed: formatSpeed(downloadValue),
        uploadSpeed: formatSpeed(uploadValue),
        ping: pingValue > 0 ? `${pingValue} ms` : '--',
        isLoading: false
      });
    } catch (error) {
      console.error('Ağ ölçümü hatası:', error);
      setStats({
        downloadSpeed: '--',
        uploadSpeed: '--',
        ping: '--',
        isLoading: false
      });
    }
  };

  // VPN bağlantı durumu değişince ölçümü başlat
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Bağlantı durumu değiştiğinde hemen ölç
    measureAll();
    
    // Bağlıysa periyodik olarak ölç
    if (isConnected) {
      interval = setInterval(measureAll, 60000); // 60 saniyede bir ölç
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  return stats;
}; 