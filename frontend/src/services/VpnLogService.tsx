import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to import RNFS safely
let RNFS: any = null;
try {
  RNFS = require('react-native-fs');
} catch (error) {
  console.warn('react-native-fs not available, file logging disabled');
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum LogCategory {
  VPN_CONNECTION = 'VPN_CONNECTION',
  SECURITY = 'SECURITY',
  AUTHENTICATION = 'AUTHENTICATION',
  NETWORK = 'NETWORK',
  USER_ACTION = 'USER_ACTION',
  SYSTEM = 'SYSTEM'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  userId?: string;
  sessionId?: string;
  serverLocation?: string;
  errorCode?: string;
  ipAddress?: string;
}

class VpnLogService {
  private static instance: VpnLogService;  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000; // Maksimum log sayısı
  private readonly STORAGE_KEY = 'vpn_logs';
  private readonly LOG_FILE_PATH = RNFS ? RNFS.DocumentDirectoryPath + '/secvpn_logs.txt' : null;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.loadLogsFromStorage();
  }

  public static getInstance(): VpnLogService {
    if (!VpnLogService.instance) {
      VpnLogService.instance = new VpnLogService();
    }
    return VpnLogService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  // Ana log fonksiyonu
  private async addLog(
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: any,
    additionalInfo?: Partial<LogEntry>
  ): Promise<void> {
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      category,
      message,
      details,
      sessionId: this.sessionId,
      ...additionalInfo
    };

    this.logs.unshift(logEntry); // Yeni logları başa ekle

    // Log sayısını sınırla
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }    await this.saveLogsToStorage();
    await this.appendLogToFile(logEntry);

    // Kritik hataları konsola da yazdır
    if (level === LogLevel.CRITICAL || level === LogLevel.ERROR) {
      console.error(`[${level}] ${category}: ${message}`, details);
    }
  }

  // Genel log metodu
  async log(
    message: string,
    category: LogCategory,
    level: LogLevel = LogLevel.INFO,
    details?: any,
    additionalInfo?: Partial<LogEntry>
  ): Promise<void> {
    await this.addLog(level, category, message, details, additionalInfo);
  }

  // VPN bağlantı logları
  async logVpnConnection(serverLocation: string, success: boolean, details?: any): Promise<void> {
    await this.addLog(
      success ? LogLevel.INFO : LogLevel.ERROR,
      LogCategory.VPN_CONNECTION,
      success 
        ? `VPN connection established to ${serverLocation}`
        : `VPN connection failed to ${serverLocation}`,
      details,
      { serverLocation }
    );
  }

  async logVpnDisconnection(reason: string, serverLocation?: string): Promise<void> {
    await this.addLog(
      LogLevel.INFO,
      LogCategory.VPN_CONNECTION,
      `VPN disconnected: ${reason}`,
      { reason },
      { serverLocation }
    );
  }

  async logVpnReconnection(serverLocation: string, attempt: number): Promise<void> {
    await this.addLog(
      LogLevel.WARNING,
      LogCategory.VPN_CONNECTION,
      `VPN reconnection attempt ${attempt} to ${serverLocation}`,
      { attempt },
      { serverLocation }
    );
  }

  // Güvenlik logları
  async logSecurityThreat(threatType: string, severity: 'low' | 'medium' | 'high', details?: any): Promise<void> {
    const level = severity === 'high' ? LogLevel.CRITICAL : 
                  severity === 'medium' ? LogLevel.WARNING : LogLevel.INFO;
    
    await this.addLog(
      level,
      LogCategory.SECURITY,
      `Security threat detected: ${threatType}`,
      { threatType, severity, ...details }
    );
  }

  async logSecurityScan(result: 'passed' | 'failed', details?: any): Promise<void> {
    await this.addLog(
      result === 'passed' ? LogLevel.INFO : LogLevel.WARNING,
      LogCategory.SECURITY,
      `Security scan ${result}`,
      details
    );
  }

  async logAIModelAnalysis(riskLevel: string, score: number, threats: string[]): Promise<void> {
    await this.addLog(
      LogLevel.INFO,
      LogCategory.SECURITY,
      `AI security analysis completed - Risk: ${riskLevel}, Score: ${score}`,
      { riskLevel, score, threats, model: 'vpn_guvenlik_model.pkl' }
    );
  }

  // Kimlik doğrulama logları
  async logAuthentication(userId: string, success: boolean, method: string): Promise<void> {
    await this.addLog(
      success ? LogLevel.INFO : LogLevel.WARNING,
      LogCategory.AUTHENTICATION,
      success 
        ? `User authentication successful`
        : `User authentication failed`,
      { method },
      { userId }
    );
  }

  async logLogout(userId: string): Promise<void> {
    await this.addLog(
      LogLevel.INFO,
      LogCategory.AUTHENTICATION,
      'User logged out',
      {},
      { userId }
    );
  }

  // Ağ logları
  async logNetworkChange(networkType: string, isConnected: boolean): Promise<void> {
    await this.addLog(
      LogLevel.INFO,
      LogCategory.NETWORK,
      `Network changed to ${networkType}, connected: ${isConnected}`,
      { networkType, isConnected }
    );
  }

  async logBandwidthUsage(upload: number, download: number, serverLocation?: string): Promise<void> {
    await this.addLog(
      LogLevel.DEBUG,
      LogCategory.NETWORK,
      `Bandwidth usage - Upload: ${upload}MB, Download: ${download}MB`,
      { upload, download },
      { serverLocation }
    );
  }

  // Kullanıcı eylem logları
  async logUserAction(action: string, details?: any, userId?: string): Promise<void> {
    await this.addLog(
      LogLevel.INFO,
      LogCategory.USER_ACTION,
      `User action: ${action}`,
      details,
      { userId }
    );
  }

  // Sistem logları
  async logSystemError(error: Error, context?: string): Promise<void> {
    await this.addLog(
      LogLevel.ERROR,
      LogCategory.SYSTEM,
      `System error: ${error.message}`,
      { 
        stack: error.stack, 
        context,
        errorName: error.name 
      },
      { errorCode: error.name }
    );
  }

  async logAppStart(): Promise<void> {
    await this.addLog(
      LogLevel.INFO,
      LogCategory.SYSTEM,
      'Application started',
      { 
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      }
    );
  }

  async logAppClose(): Promise<void> {
    await this.addLog(
      LogLevel.INFO,
      LogCategory.SYSTEM,
      'Application closed',
      { sessionId: this.sessionId }
    );
  }

  // Log okuma ve filtreleme
  getLogs(
    filters?: {
      level?: LogLevel;
      category?: LogCategory;
      startDate?: Date;
      endDate?: Date;
      userId?: string;
      limit?: number;
    }
  ): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(0, filters.limit);
      }
    }

    return filteredLogs;
  }

  // Log istatistikleri
  getLogStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    lastHour: number;
    lastDay: number;
  } {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<LogLevel, number>,
      byCategory: {} as Record<LogCategory, number>,
      lastHour: this.logs.filter(log => log.timestamp >= hourAgo).length,
      lastDay: this.logs.filter(log => log.timestamp >= dayAgo).length
    };

    // Level istatistikleri
    Object.values(LogLevel).forEach(level => {
      stats.byLevel[level] = this.logs.filter(log => log.level === level).length;
    });

    // Category istatistikleri
    Object.values(LogCategory).forEach(category => {
      stats.byCategory[category] = this.logs.filter(log => log.category === category).length;
    });

    return stats;
  }
  // Storage işlemleri
  private async saveLogsToStorage(): Promise<void> {
    try {
      const logsToSave = this.logs.slice(0, 500); // Sadece son 500 logu kaydet
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Failed to save logs to storage:', error);
    }
  }
  private async appendLogToFile(logEntry: LogEntry): Promise<void> {
    if (!RNFS || !this.LOG_FILE_PATH) {
      // RNFS not available, skip file logging
      return;
    }
    
    try {
      const logLine = `[${logEntry.timestamp.toISOString()}] [${logEntry.level}] [${logEntry.category}] ${logEntry.message}${logEntry.details ? ' | Details: ' + JSON.stringify(logEntry.details) : ''}\n`;
      await RNFS.appendFile(this.LOG_FILE_PATH, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to append log to file:', error);
    }
  }

  private async loadLogsFromStorage(): Promise<void> {
    try {
      const storedLogs = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        this.logs = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load logs from storage:', error);
    }
  }

  // Log temizleme
  async clearLogs(): Promise<void> {
    this.logs = [];
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  async clearOldLogs(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);
    await this.saveLogsToStorage();
  }

  // Log export
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = 'Timestamp,Level,Category,Message,Session ID,Server Location\n';
      const csvData = this.logs.map(log => 
        `"${log.timestamp.toISOString()}","${log.level}","${log.category}","${log.message}","${log.sessionId || ''}","${log.serverLocation || ''}"`
      ).join('\n');
      return headers + csvData;
    }
    
    return JSON.stringify(this.logs, null, 2);
  }
}

export default VpnLogService;
