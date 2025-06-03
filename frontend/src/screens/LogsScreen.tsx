import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  Share,
  StatusBar,
} from 'react-native';
import VpnLogService, { LogEntry, LogLevel, LogCategory } from '../services/VpnLogService';

// Try to import RNFS safely
let RNFS: any = null;
try {
  RNFS = require('react-native-fs');
} catch (error) {
  console.warn('react-native-fs not available, export functionality limited');
}

const LogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'ALL'>('ALL');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, selectedLevel, selectedCategory]);

  const loadLogs = () => {
    const logService = VpnLogService.getInstance();
    const allLogs = logService.getLogs({ limit: 200 });
    setLogs(allLogs);
  };

  const loadStats = () => {
    const logService = VpnLogService.getInstance();
    const logStats = logService.getLogStats();
    setStats(logStats);
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    setFilteredLogs(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
    loadStats();
    setRefreshing(false);
  };

  const clearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await VpnLogService.getInstance().clearLogs();
            loadLogs();
            loadStats();
          },
        },
      ]
    );
  };
  const exportLogs = async () => {
    try {
      const logService = VpnLogService.getInstance();
      const csvData = logService.exportLogs('csv');
      
      if (RNFS) {
        // Use file system if available
        const fileName = `SecVPN_logs_${new Date().toISOString().split('T')[0]}.csv`;
        const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        
        await RNFS.writeFile(filePath, csvData, 'utf8');
        
        // Share işlemi
        await Share.share({
          url: `file://${filePath}`,
          title: 'SecVPN Logs Export',
          message: 'SecVPN application logs',
        });
      } else {
        // Fallback to sharing text directly
        await Share.share({
          message: csvData,
          title: 'SecVPN Logs Export',
        });
      }
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export logs');
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG: return '#6B7280';
      case LogLevel.INFO: return '#3B82F6';
      case LogLevel.WARNING: return '#F59E0B';
      case LogLevel.ERROR: return '#EF4444';
      case LogLevel.CRITICAL: return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category: LogCategory) => {
    switch (category) {
      case LogCategory.VPN_CONNECTION: return '🔗';
      case LogCategory.SECURITY: return '🛡️';
      case LogCategory.AUTHENTICATION: return '🔐';
      case LogCategory.NETWORK: return '🌐';
      case LogCategory.USER_ACTION: return '👤';
      case LogCategory.SYSTEM: return '⚙️';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderLogItem = ({ item }: { item: LogEntry }) => (
    <TouchableOpacity
      style={[styles.logItem, { borderLeftColor: getLevelColor(item.level) }]}
      onPress={() => {
        setSelectedLog(item);
        setShowDetails(true);
      }}
    >
      <View style={styles.logHeader}>
        <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
        <Text style={[styles.logLevel, { color: getLevelColor(item.level) }]}>
          {item.level}
        </Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      <Text style={styles.logMessage} numberOfLines={2}>
        {item.message}
      </Text>
      <Text style={styles.logCategory}>{item.category}</Text>
    </TouchableOpacity>
  );

  const renderFilterButton = (
    title: string,
    value: string,
    selectedValue: string,
    onSelect: (value: any) => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedValue === value && styles.filterButtonActive,
      ]}
      onPress={() => onSelect(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedValue === value && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Developer Logs</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={exportLogs}>
            <Text style={styles.actionButtonText}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={clearLogs}>
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>📊 Statistics</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statItem}>Total: {stats.total}</Text>
            <Text style={styles.statItem}>Last Hour: {stats.lastHour}</Text>
            <Text style={styles.statItem}>Last Day: {stats.lastDay}</Text>
          </View>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Level:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('ALL', 'ALL', selectedLevel, setSelectedLevel)}
          {Object.values(LogLevel).map(level =>
            renderFilterButton(level, level, selectedLevel, setSelectedLevel)
          )}
        </ScrollView>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Category:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('ALL', 'ALL', selectedCategory, setSelectedCategory)}
          {Object.values(LogCategory).map(category =>
            renderFilterButton(category.replace('_', ' '), category, selectedCategory, setSelectedCategory)
          )}
        </ScrollView>
      </View>

      {/* Logs List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={item => item.id}
        style={styles.logsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📋 No logs found</Text>
          </View>
        }
      />

      {/* Log Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {selectedLog && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID:</Text>
                <Text style={styles.detailValue}>{selectedLog.id}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Timestamp:</Text>
                <Text style={styles.detailValue}>
                  {formatTimestamp(selectedLog.timestamp)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Level:</Text>
                <Text style={[styles.detailValue, { color: getLevelColor(selectedLog.level) }]}>
                  {selectedLog.level}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>
                  {getCategoryIcon(selectedLog.category)} {selectedLog.category}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Message:</Text>
                <Text style={styles.detailValue}>{selectedLog.message}</Text>
              </View>
              
              {selectedLog.sessionId && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Session ID:</Text>
                  <Text style={styles.detailValue}>{selectedLog.sessionId}</Text>
                </View>
              )}
              
              {selectedLog.serverLocation && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Server Location:</Text>
                  <Text style={styles.detailValue}>{selectedLog.serverLocation}</Text>
                </View>
              )}
              
              {selectedLog.details && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Details:</Text>
                  <Text style={styles.detailValue}>
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#F9FAFB',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  filtersContainer: {
    padding: 12,
    backgroundColor: '#1F2937',
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#374151',
    borderRadius: 16,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logsList: {
    flex: 1,
    padding: 16,
  },
  logItem: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 'auto',
  },
  logMessage: {
    fontSize: 14,
    color: '#F9FAFB',
    marginBottom: 4,
  },
  logCategory: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#F9FAFB',
    backgroundColor: '#1F2937',
    padding: 8,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
});

export default LogsScreen;
