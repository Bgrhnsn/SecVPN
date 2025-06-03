import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Android Emulator için doğru IP adresi
// DÜZELTME: Android için 10.0.2.2, iOS için localhost kullan
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

// API bağlantı hatası sayacı - art arda hatalar için
let connectionFailuresCount = 0;
const MAX_FAILURES = 3; // 3 ardışık hatadan sonra offline moda geç

// Timeout değerlerini artırarak ağ sorunlarını tespit etmeyi kolaylaştırma
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// Offline durumu yönetimi
let isOffline = false;

// Ağ hatalarını yakalama ve daha detaylı hata mesajı gösterme
api.interceptors.request.use(
  async (config) => {
    try {
      // Eğer offline modda ise ve bir GET isteği değilse, doğrudan hata fırlat
      // GET istekleri bile mock verilerle hizmet verebilir
      if (isOffline && config.method !== 'get') {
        return Promise.reject(new Error('Device is in offline mode'));
      }
      
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('API Request:', config.method, config.url); 
      return config;
    } catch (e) {
      console.error('Request interceptor error:', e);
      return config;
    }
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı - hata yönetimi için
api.interceptors.response.use(
  (response) => {
    // Başarılı yanıtta bağlantı hata sayacını sıfırla
    connectionFailuresCount = 0;
    isOffline = false;
    return response;
  },
  async (error) => {
    // Network hataları için daha fazla bilgi
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      connectionFailuresCount++;
      console.error(`Network error detected (${connectionFailuresCount}/${MAX_FAILURES}):`, {
        baseURL: API_URL,
        message: 'Could not connect to the server.'
      });
      
      // Eğer ardışık hata sayısı maksimuma ulaştıysa, offline moda geç
      if (connectionFailuresCount >= MAX_FAILURES) {
        isOffline = true;
        console.warn('Too many connection failures. Switching to offline mode.');
      }
    }
    
    // Token geçersiz olduğunda (401 hata kodları) oturumu sonlandırma
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // Burada kullanıcıyı giriş ekranına yönlendirebilirsiniz
    }
    return Promise.reject(error);
  }
);

// API'nin offline durumunu kontrol etme
export const isApiOffline = () => isOffline;

// Offline durumunu manuel değiştirme - test için kullanılabilir
export const setApiOffline = (offline: boolean) => {
  isOffline = offline;
  connectionFailuresCount = offline ? MAX_FAILURES : 0;
};

export default api; 