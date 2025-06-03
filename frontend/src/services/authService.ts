import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  token: string;
}

class AuthService {
  // Kullanıcı kaydı
  async register(data: RegisterData): Promise<User> {
    try {
      console.log('Registering with data:', JSON.stringify(data));
      const response = await api.post('/auth/register', data);
      
      console.log('Registration successful. Response:', JSON.stringify(response.data));
      
      // Token ve kullanıcı verilerini kaydetme
      await this.storeUserData(response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Register error details:', error);
      if (error.message === 'Network Error') {
        console.error('Server connection failed. Check if the backend server is running.');
      }
      throw error;
    }
  }

  // Kullanıcı girişi
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('Logging in with:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      
      console.log('Login successful');
      
      // Token ve kullanıcı verilerini kaydetme
      await this.storeUserData(response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', error);
      if (error.message === 'Network Error') {
        console.error('Server connection failed. Check if the backend server is running.');
      }
      throw error;
    }
  }

  // Oturumu kapatma
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Kullanıcı bilgilerini alma
  async getUserProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Token ve kullanıcı bilgilerini saklama
  private async storeUserData(userData: User): Promise<void> {
    try {
      await AsyncStorage.setItem('userToken', userData.token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  // Saklanan kullanıcı bilgilerini alma
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // Kullanıcının oturumunun açık olup olmadığını kontrol etme
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token !== null;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }
}

export default new AuthService(); 