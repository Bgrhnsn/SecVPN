import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import RNSimpleOpenvpn, {
  addVpnStateListener,
  removeVpnStateListener,
} from 'react-native-simple-openvpn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVERS, REAL_SERVER } from './ServerService';
import api from './api';
import VpnLogService, { LogCategory, LogLevel } from './VpnLogService';

const isIPhone = Platform.OS === 'ios';

export interface VpnServer {
  _id: string;
  serverId: string;
  serverName: string;
  country: string;
  city: string;
  load: number;
  bandwidth: number;
  status: 'online' | 'offline' | 'maintenance';
}

export interface VpnStatus {
  connected: boolean;
  sessionId?: string;
  server?: {
    name: string;
    location: string;
    ip: string;
  };
  startTime?: Date;
  duration?: number;
  bytesUploaded?: number;
  bytesDownloaded?: number;
  message?: string;
}

export interface VpnSessionStats {
  sessions: VpnSession[];
  stats: {
    totalSessions: number;
    totalDuration: number;
    totalBytesUploaded: number;
    totalBytesDownloaded: number;
    averageDuration: number;
  };
}

export interface VpnSession {
  id: string;
  serverId: string;
  serverLocation: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  bytesUploaded: number;
  bytesDownloaded: number;
  status: 'connected' | 'disconnected' | 'failed';
}

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

class VpnService {
  private currentState: VpnState = 'DISCONNECTED';
  private listenerId: string | null = null;
  private currentServerId: string | null = null;
  private connectTime: Date | null = null;
  private mockServers: VpnServer[] = [
    {
      _id: 'us1',
      serverId: 'us-server-1',
      serverName: 'US Server 1',
      country: 'United States',
      city: 'New York',
      load: 65,
      bandwidth: 200,
      status: 'online'
    },
    {
      _id: 'uk1',
      serverId: 'uk-server-1',
      serverName: 'UK Server 1',
      country: 'United Kingdom',
      city: 'London',
      load: 45,
      bandwidth: 180,
      status: 'online'
    },
    {
      _id: 'jp1',
      serverId: 'jp-server-1',
      serverName: 'Japan Server 1', 
      country: 'Japan',
      city: 'Tokyo',
      load: 30,
      bandwidth: 150,
      status: 'online'
    }
  ];

  constructor() {
    this.initializeVpn();
  }  // VPN dinleyicisini ve durumu başlat
  private async initializeVpn() {
    try {
      VpnLogService.getInstance().log('VPN service initialization started', LogCategory.SYSTEM, LogLevel.INFO);
      
      if (isIPhone) {
        // iOS'te arka planda sistem durumunu izler
        await RNSimpleOpenvpn.observeState();
      }

      // Dinleyici ekle → id'yi sakla
      const id = addVpnStateListener(e => {
        console.log("VPN durum değişikliği (ham):", e.state);
        const previousState = this.currentState;
        this.currentState = mapVpnState(e.state);
        console.log("VPN durum değişikliği (map sonrası):", this.currentState);
        
        // Durum değişikliğini logla
        VpnLogService.getInstance().log(
          `VPN state changed from ${previousState} to ${this.currentState}`,
          LogCategory.VPN_CONNECTION,
          LogLevel.INFO,
          { previousState, newState: this.currentState }
        );
      });
      
      if (typeof id === 'string') {
        this.listenerId = id;
      }
      
      VpnLogService.getInstance().log('VPN service initialization completed successfully', LogCategory.SYSTEM, LogLevel.INFO);
    } catch (error) {
      console.error('VPN initialize error:', error);
      VpnLogService.getInstance().log(`VPN initialization failed: ${error}`, LogCategory.SYSTEM, LogLevel.ERROR, { error });
    }
  }

  // VPN'i kapat ve dinleyiciyi temizle
  public async cleanup() {
    try {
      if (this.listenerId) {
        removeVpnStateListener();
        this.listenerId = null;
      }
      if (isIPhone) {
        await RNSimpleOpenvpn.stopObserveState();
      }
    } catch (error) {
      console.error('VPN cleanup error:', error);
    }
  }

  // Server service'ten sunucuları al ve API formatına dönüştür
  private convertUIServersToApiFormat(): VpnServer[] {
    return SERVERS.map((server) => ({
      _id: server.id,
      serverId: `server-${server.id}`,
      serverName: `${server.country} Server`,
      country: server.country,
      city: this.getCityForCountry(server.country),
      load: Math.floor(Math.random() * 85) + 15, // 15-100 arası rastgele yük
      bandwidth: Math.floor(Math.random() * 150) + 50, // 50-200 arası rastgele bant genişliği
      status: 'online'
    }));
  }

  // Ülke adına göre varsayılan şehir döndür
  private getCityForCountry(country: string): string {
    const cities: {[key: string]: string} = {
      'United States': 'New York',
      'United Kingdom': 'London',
      'Germany': 'Berlin',
      'Japan': 'Tokyo',
      'Singapore': 'Singapore'
    };
    
    return cities[country] || 'Unknown';
  }

  // VPN sunucularını getirme
  async getServers(): Promise<VpnServer[]> {
    try {
      const response = await api.get('/vpn/servers');
      return response.data;
    } catch (error) {
      console.error('Failed to get servers from API, using mock data', error);
      
      // API çalışmadığında UI sunucuları kullan
      return this.convertUIServersToApiFormat();
    }
  }

  // VPN durumunu kontrol etme
  async getStatus(): Promise<VpnStatus> {
    try {
      const response = await api.get('/vpn/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get VPN status from API, using local state', error);
      
      // API erişimi yoksa durumu gerçek OpenVPN durumundan belirle
      const isConnected = this.currentState === 'CONNECTED';
      
      return {
        connected: isConnected,
        sessionId: isConnected ? 'local-session-id' : undefined,
        server: isConnected ? {
          name: this.currentServerId ? this.getServerNameById(this.currentServerId) || 'Selected Server' : 'VPN Server',
          location: this.currentServerId ? this.getServerLocationById(this.currentServerId) || 'Unknown' : 'Remote Location',
          ip: REAL_SERVER.remoteAddress
        } : undefined,
        startTime: this.connectTime || undefined,
        duration: this.calculateDuration(),
        bytesUploaded: isConnected ? Math.floor(Math.random() * 1024 * 1024) : 0,
        bytesDownloaded: isConnected ? Math.floor(Math.random() * 1024 * 1024 * 5) : 0
      };
    }
  }
  // VPN'e bağlanma
  async connect(serverId: string): Promise<any> {
    try {
      VpnLogService.getInstance().log(
        `VPN connection attempt started to server: ${serverId}`,
        LogCategory.VPN_CONNECTION,
        LogLevel.INFO,
        { serverId }
      );

      // Önce API'den yapılandırmayı almayı dene
      const response = await api.post('/vpn/connect', { serverId });
      console.log("API bağlantı yanıtı:", response.data);
      
      this.currentServerId = serverId;
      this.connectTime = new Date();
      
      // OpenVPN ile bağlanma işlemi
      return await this.startRealVpnConnection();
    } catch (error) {
      console.error('VPN Connect error:', error);
      
      VpnLogService.getInstance().log(
        `API connection failed, attempting direct VPN connection`,
        LogCategory.VPN_CONNECTION,
        LogLevel.WARNING,
        { error: error instanceof Error ? error.message : String(error) }
      );
      
      // API erişimi yoksa, gerçek VPN bağlantısı yap
      this.currentServerId = serverId;
      this.connectTime = new Date();
      
      // OpenVPN ile bağlan
      return await this.startRealVpnConnection();
    }
  }
  // Gerçek VPN bağlantısı başlatma
  private async startRealVpnConnection(): Promise<any> {
    try {
      console.log("VPN bağlantısı başlatılıyor...");
      
      const serverLocation = this.currentServerId ? 
        this.getServerLocationById(this.currentServerId) || 'Unknown' : 'Unknown';
      
      VpnLogService.getInstance().log(
        `Starting OpenVPN connection to ${REAL_SERVER.remoteAddress}`,
        LogCategory.VPN_CONNECTION,
        LogLevel.INFO,
        { 
          serverAddress: REAL_SERVER.remoteAddress,
          serverId: this.currentServerId,
          serverLocation 
        }
      );
      
      // Bağlantı seçeneklerini hazırla
      const connectOptions = {
        ...REAL_SERVER
      };
      
      // iOS için ekstra ayarlar
      if (isIPhone) {
        // iOS seçenekleri ekle
        await RNSimpleOpenvpn.connect({
          ...connectOptions,
          providerBundleIdentifier: 'com.vpnapp.openvpn', // Varsayılan değer, değiştirilebilir
          localizedDescription: 'SecVPN',
        } as any);
      } else {
        // Android için düz bağlantı
        await RNSimpleOpenvpn.connect(connectOptions as any);
      }
      
      console.log("VPN bağlantı isteği gönderildi - Gerçek sunucuya bağlanılıyor:", REAL_SERVER.remoteAddress);
      
      const result = {
        success: true,
        message: 'VPN connection request sent',
        sessionId: 'session-' + Date.now()
      };
      
      VpnLogService.getInstance().logVpnConnection(serverLocation, true, result);
      
      return result;
    } catch (err) {
      console.warn('VPN connect error', err);
      
      const serverLocation = this.currentServerId ? 
        this.getServerLocationById(this.currentServerId) || 'Unknown' : 'Unknown';
      
      VpnLogService.getInstance().logVpnConnection(serverLocation, false, { 
        error: err instanceof Error ? err.message : String(err) 
      });
      
      throw err;
    }
  }
  // VPN bağlantısını kesme
  async disconnect(stats = { bytesUploaded: 0, bytesDownloaded: 0 }): Promise<any> {
    try {
      const serverLocation = this.currentServerId ? 
        this.getServerLocationById(this.currentServerId) || 'Unknown' : 'Unknown';
      
      VpnLogService.getInstance().log(
        `VPN disconnection initiated`,
        LogCategory.VPN_CONNECTION,
        LogLevel.INFO,
        { stats, serverLocation }
      );

      // API'ye bağlantı kesme isteği gönderme
      const response = await api.post('/vpn/disconnect', stats);
      console.log("API bağlantı kesme yanıtı:", response.data);
      
      // Gerçek VPN bağlantısını kes
      return await this.stopRealVpnConnection();
    } catch (error) {
      console.error('VPN Disconnect error:', error);
      
      VpnLogService.getInstance().log(
        `API disconnect failed, attempting direct disconnection`,
        LogCategory.VPN_CONNECTION,
        LogLevel.WARNING,
        { error: error instanceof Error ? error.message : String(error) }
      );
      
      // API erişimi yoksa, gerçek VPN bağlantısını kes
      return await this.stopRealVpnConnection();
    }
  }
  // Gerçek VPN bağlantısını kesme
  private async stopRealVpnConnection(): Promise<any> {
    try {
      console.log("VPN bağlantısı sonlandırılıyor...");
      
      const serverLocation = this.currentServerId ? 
        this.getServerLocationById(this.currentServerId) || 'Unknown' : 'Unknown';
      
      await RNSimpleOpenvpn.disconnect();
      
      VpnLogService.getInstance().logVpnDisconnection('User requested disconnection', serverLocation);
      
      this.currentServerId = null;
      this.connectTime = null;
      
      console.log("VPN bağlantı kesme isteği gönderildi");
      
      return {
        success: true,
        message: 'VPN disconnect request sent'
      };
    } catch (err) {
      console.warn('VPN disconnect error', err);
      
      const serverLocation = this.currentServerId ? 
        this.getServerLocationById(this.currentServerId) || 'Unknown' : 'Unknown';
      
      VpnLogService.getInstance().log(
        `VPN disconnection failed: ${err}`,
        LogCategory.VPN_CONNECTION,
        LogLevel.ERROR,
        { error: err instanceof Error ? err.message : String(err), serverLocation }
      );
      
      // Hata olsa bile kaynakları temizle
      this.currentServerId = null;
      this.connectTime = null;
      
      throw err;
    }
  }

  // İstatistikleri alma
  async getSessionStats(): Promise<VpnSessionStats> {
    try {
      const response = await api.get('/vpn/stats');
      return response.data;
    } catch (error) {
      console.error('Get VPN stats error:', error);
      
      // Basit istatistik oluştur
      const isConnected = this.currentState === 'CONNECTED';
      const mockSession: VpnSession = {
        id: 'session-' + Date.now(),
        serverId: this.currentServerId || 'unknown',
        serverLocation: this.currentServerId ? this.getServerLocationById(this.currentServerId) || 'Unknown' : 'Unknown',
        startTime: this.connectTime || new Date(),
        endTime: null,
        duration: this.calculateDuration() || 0,
        bytesUploaded: Math.floor(Math.random() * 1024 * 1024),
        bytesDownloaded: Math.floor(Math.random() * 1024 * 1024 * 5),
        status: isConnected ? 'connected' : 'disconnected'
      };
      
      return {
        sessions: [mockSession],
        stats: {
          totalSessions: 1,
          totalDuration: mockSession.duration || 0,
          totalBytesUploaded: mockSession.bytesUploaded,
          totalBytesDownloaded: mockSession.bytesDownloaded,
          averageDuration: mockSession.duration || 0
        }
      };
    }
  }

  // VPN bağlantı durumunu kontrol etme
  isVpnConnected(): boolean {
    return this.currentState === 'CONNECTED';
  }

  // VPN durumunu string olarak al
  getVpnState(): VpnState {
    return this.currentState;
  }

  // Aktif sunucuyu alma
  getCurrentServerId(): string | null {
    return this.currentServerId;
  }
  
  // Yardımcı metodlar
  private calculateDuration(): number | undefined {
    if (this.currentState !== 'CONNECTED' || !this.connectTime) return undefined;
    
    const now = new Date();
    const diffMs = now.getTime() - this.connectTime.getTime();
    return Math.floor(diffMs / 1000); // Saniye cinsinden
  }
  
  private getServerNameById(serverId: string): string | null {
    // Önce UI sunucularından kontrol et
    const uiServer = SERVERS.find(s => `server-${s.id}` === serverId);
    if (uiServer) {
      return `${uiServer.country} Server`;
    }
    
    // Sonra mock sunuculardan kontrol et
    const mockServer = this.mockServers.find(s => s.serverId === serverId);
    return mockServer ? mockServer.serverName : null;
  }
  
  private getServerLocationById(serverId: string): string | null {
    // Önce UI sunucularından kontrol et
    const uiServer = SERVERS.find(s => `server-${s.id}` === serverId);
    if (uiServer) {
      return `${this.getCityForCountry(uiServer.country)}, ${uiServer.country}`;
    }
    
    // Sonra mock sunuculardan kontrol et
    const mockServer = this.mockServers.find(s => s.serverId === serverId);
    return mockServer ? `${mockServer.city}, ${mockServer.country}` : null;
  }
}

export default new VpnService(); 