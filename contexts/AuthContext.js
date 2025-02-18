import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { fetchCouriers } from '../Data/Data'; // fetchCouriers fonksiyonunu içe aktar

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Mevcut kullanıcıyı saklamak için state
  const [couriers, setCouriers] = useState([]); // Tüm kuryeleri saklamak için state

  // Bileşen yüklendiğinde kuryeleri ve mevcut kullanıcıyı yükle
  useEffect(() => {
    const initializeData = async () => {
      await loadCouriers(); // Tüm kuryeleri yükle
      await loadUser(); // Mevcut kullanıcıyı yükle
    };
    initializeData();
  }, []);

  // Tüm kuryeleri API'dan yükle
  const loadCouriers = async () => {
    try {
      const data = await fetchCouriers();
      setCouriers(data);
    } catch (error) {
      console.error("Kuryeleri yükleme hatası:", error);
    }
  };

  // AsyncStorage'dan mevcut kullanıcıyı yükle
  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Kullanıcıyı yükleme hatası:", error);
    }
  };

  // Parolayı SHA-256 ile hashle
  const hashPassword = async (password) => {
    try {
      return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
    } catch (error) {
      console.error('Şifre hashleme hatası:', error);
    }
  };

  // Kullanıcı giriş fonksiyonu
  const login = async (nickname, password) => {
    try {
      const foundCourier = couriers.find((c) => c.nickname === nickname);
      if (foundCourier) {
        const match = await verifyPassword(password, foundCourier.password);
        if (match) {
          setUser(foundCourier);
          await AsyncStorage.setItem('user', JSON.stringify(foundCourier));
          return { success: true };
        } else {
          return { success: false, message: 'Şifre yanlış' };
        }
      } else {
        return { success: false, message: 'Kullanıcı bulunamadı' };
      }
    } catch (error) {
      console.error('Giriş sırasında bir hata oluştu:', error);
      return { success: false, message: 'Giriş hatası' };
    }
  };

  // Şifre doğrulama fonksiyonu
  const verifyPassword = async (password, hashedPassword) => {
    const hashedInputPassword = await hashPassword(password);
    return hashedInputPassword === hashedPassword;
  };

  // Kullanıcı çıkış fonksiyonu
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Çıkış sırasında bir hata oluştu:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loadCouriers }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
