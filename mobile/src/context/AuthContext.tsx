import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/endpoints';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phoneNumber: string, otpCode: string, name?: string) => Promise<void>;
  registerUser: (phoneNumber: string, otpCode: string, name: string, password: string, state: string, city: string) => Promise<void>;
  loginWithPassword: (phoneNumber: string, password: string) => Promise<void>;

  logout: () => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [accessToken, userJson] = await AsyncStorage.multiGet(['accessToken', 'user']);
      
      if (accessToken[1] && userJson[1]) {
        setUser(JSON.parse(userJson[1]));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phoneNumber: string) => {
    await authAPI.sendOTP(phoneNumber);
  };

  const login = async (phoneNumber: string, otpCode: string, name?: string) => {
    try {
      const response = await authAPI.verifyOTP(phoneNumber, otpCode, name);
      
      // Save tokens and user data
      await AsyncStorage.multiSet([
        ['accessToken', response.accessToken],
        ['refreshToken', response.refreshToken],
        ['user', JSON.stringify(response.user)],
      ]);

      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const registerUser = async (phoneNumber: string, otpCode: string, name: string, password: string, state: string, city: string) => {
    try {
      const response = await authAPI.registerWithOTP(phoneNumber, otpCode, name, password, state, city);
      
      // Save tokens and user data
      await AsyncStorage.multiSet([
        ['accessToken', response.accessToken],
        ['refreshToken', response.refreshToken],
        ['user', JSON.stringify(response.user)],
      ]);

      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const loginWithPassword = async (phoneNumber: string, password: string) => {
    try {
      const response = await authAPI.loginWithPassword(phoneNumber, password);
      
      // Save tokens and user data
      await AsyncStorage.multiSet([
        ['accessToken', response.accessToken],
        ['refreshToken', response.refreshToken],
        ['user', JSON.stringify(response.user)],
      ]);

      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };



  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        registerUser,
        loginWithPassword,
        logout,
        sendOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
