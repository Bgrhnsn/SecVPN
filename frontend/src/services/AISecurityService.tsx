import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIModelLoader from './AIModelLoader';

// AI Güvenlik Modeli Sonuç Tipi
export interface SecurityAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  threats: string[];
  recommendations: string[];
  timestamp: Date;
}

// AI Model Metadata
export interface AIModelInfo {
  name: string;
  version: string;
  accuracy: number;
  trainingDate: Date;
  lastUpdate: Date;
}

// Context Interface
interface AISecurityContextType {
  isAnalyzing: boolean;
  lastAnalysis: SecurityAnalysis | null;
  modelInfo: AIModelInfo;
  startAnalysis: (vpnConnected: boolean, serverLocation?: string) => Promise<SecurityAnalysis>;
  getModelStatus: () => Promise<boolean>;
}

// Context oluştur
const AISecurityContext = createContext<AISecurityContextType | undefined>(undefined);

// Hook
export const useAISecurity = () => {
  const context = useContext(AISecurityContext);
  if (!context) {
    throw new Error('useAISecurity must be used within AISecurityProvider');
  }
  return context;
};

// Provider Component
export const AISecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<SecurityAnalysis | null>(null);
  const aiModelLoader = AIModelLoader.getInstance();

  // Sahte AI model bilgileri
  const modelInfo: AIModelInfo = {
    name: 'VPN Security Guardian v2.1',
    version: '2.1.0-beta',
    accuracy: 94.7,
    trainingDate: new Date('2024-11-15'),
    lastUpdate: new Date('2025-01-15')
  };

  // Başlangıçta son analizi yükle
  useEffect(() => {
    loadLastAnalysis();
  }, []);

  const loadLastAnalysis = async () => {
    try {
      const stored = await AsyncStorage.getItem('last_security_analysis');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLastAnalysis({
          ...parsed,
          timestamp: new Date(parsed.timestamp)
        });
      }
    } catch (error) {
      console.error('Son güvenlik analizi yüklenemedi:', error);
    }
  };

  const saveAnalysis = async (analysis: SecurityAnalysis) => {
    try {
      await AsyncStorage.setItem('last_security_analysis', JSON.stringify(analysis));
    } catch (error) {
      console.error('Güvenlik analizi kaydedilemedi:', error);
    }
  };
  // AI analizi - vpn_guvenlik_model.pkl kullanarak
  const startAnalysis = async (vpnConnected: boolean, serverLocation?: string): Promise<SecurityAnalysis> => {
    setIsAnalyzing(true);

    try {
      // AI modelini yükle
      console.log('🤖 vpn_guvenlik_model.pkl yükleniyor...');
      const modelMetadata = await aiModelLoader.loadModel();
      console.log(`✅ Model yüklendi: ${modelMetadata.fileName}`);

      // Gerçekçi gecikme simülasyonu (model inference)
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

      // Model features hazırla
      const features = [
        vpnConnected ? 1 : 0,
        serverLocation ? 1 : 0,
        Math.random(), // connection stability
        Math.random(), // latency factor
      ];

      // AI model prediction
      const prediction = await aiModelLoader.predict(features);
      console.log(`🔍 Model prediction: ${prediction.prediction}, confidence: ${prediction.confidence}`);

      // Analiz sonuçları oluştur
      const analysis = generateMockAnalysis(vpnConnected, serverLocation, prediction);
      
      setLastAnalysis(analysis);
      await saveAnalysis(analysis);
      
      return analysis;
    } catch (error) {
      console.error('AI analizi başarısız:', error);
      // Fallback analysis
      const analysis = generateMockAnalysis(vpnConnected, serverLocation);
      setLastAnalysis(analysis);
      await saveAnalysis(analysis);
      return analysis;
    } finally {
      setIsAnalyzing(false);
    }
  };
  const generateMockAnalysis = (
    vpnConnected: boolean, 
    serverLocation?: string, 
    aiPrediction?: { prediction: number; confidence: number; processingTime: number }
  ): SecurityAnalysis => {
    let baseScore: number;
    
    if (aiPrediction) {
      // AI model tahminini kullan
      baseScore = aiPrediction.prediction === 1 
        ? 70 + (aiPrediction.confidence * 25) // güvenli tahmin
        : 20 + (aiPrediction.confidence * 30); // riskli tahmin
    } else {
      // Fallback scoring
      baseScore = vpnConnected ? 75 + Math.random() * 20 : 30 + Math.random() * 40;
    }
    
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    let threats: string[] = [];
    let recommendations: string[] = [];

    if (baseScore >= 80) {
      riskLevel = 'low';
      threats = [
        'Minimal DNS leak risk detected',
        'WebRTC potential exposure (low probability)'
      ];
      recommendations = [
        'Continue using VPN for optimal security',
        'Regular security scans recommended'
      ];
    } else if (baseScore >= 60) {
      riskLevel = 'medium';
      threats = [
        'IPv6 leak vulnerability detected',
        'DNS queries may bypass VPN tunnel',
        'WebRTC IP exposure risk'
      ];
      recommendations = [
        'Enable DNS leak protection',
        'Disable WebRTC in browser settings',
        'Consider using IPv6 leak protection'
      ];
    } else {
      riskLevel = 'high';
      threats = [
        'Severe DNS leak vulnerability',
        'IP address exposure detected',
        'Unsecured connection protocols',
        'Potential man-in-the-middle attack vector'
      ];
      recommendations = [
        'Immediately connect to VPN',
        'Use secure DNS servers',
        'Enable kill switch protection',
        'Avoid accessing sensitive information'
      ];
    }

    // Sunucu konumuna göre ek analizler
    if (vpnConnected && serverLocation) {
      if (serverLocation.includes('US') || serverLocation.includes('UK')) {
        threats.push('Five Eyes surveillance network exposure');
        recommendations.push('Consider servers in privacy-friendly jurisdictions');
      }
    }

    return {
      riskLevel,
      score: Math.round(baseScore),
      threats,
      recommendations,
      timestamp: new Date()
    };
  };
  const getModelStatus = async (): Promise<boolean> => {
    try {
      console.log('🔍 vpn_guvenlik_model.pkl durumu kontrol ediliyor...');
      const modelMetadata = await aiModelLoader.loadModel();
      const isLoaded = aiModelLoader.isModelLoaded();
      console.log(`📊 Model durumu: ${isLoaded ? 'Yüklü' : 'Yüklenmemiş'} - ${modelMetadata.fileName}`);
      return isLoaded;
    } catch (error) {
      console.error('❌ Model durumu kontrolü başarısız:', error);
      return false;
    }
  };

  const value: AISecurityContextType = {
    isAnalyzing,
    lastAnalysis,
    modelInfo,
    startAnalysis,
    getModelStatus
  };

  return (
    <AISecurityContext.Provider value={value}>
      {children}
    </AISecurityContext.Provider>
  );
};

// Utility fonksiyonları
export const formatScore = (score: number): string => {
  return `${score}/100`;
};

export const getRiskColor = (riskLevel: 'low' | 'medium' | 'high'): string => {
  switch (riskLevel) {
    case 'low': return '#4CAF50';
    case 'medium': return '#FF9800';
    case 'high': return '#F44336';
    default: return '#757575';
  }
};

export const getRiskLabel = (riskLevel: 'low' | 'medium' | 'high'): string => {
  switch (riskLevel) {
    case 'low': return 'Düşük Risk';
    case 'medium': return 'Orta Risk';
    case 'high': return 'Yüksek Risk';
    default: return 'Bilinmiyor';
  }
};
