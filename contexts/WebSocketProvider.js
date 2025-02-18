// WebSocketProvider.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { ip } from '../Data/Data';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => { 
    const ws = new WebSocket(`ws://${ip}:3000`);  // Sunucunun WebSocket URL'si

    ws.onopen = () => {
      console.log('WebSocket bağlantısı açıldı');
    };

    ws.onmessage = (event) => {
      try {
        const message = event.data; // Doğrudan al
        setData(message);
      } catch (error) {
        console.error('Mesaj işlenirken hata:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket bağlantısı kapandı');
    };

    ws.onerror = (error) => {
      console.error('WebSocket hata:', error);
      Alert.alert('WebSocket Hatası', 'WebSocket bağlantısında bir hata oluştu.');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendLocation = (location, courierObjectId) => {
    if (socket) {
      const { latitude, longitude } = location; // Sadece latitude ve longitude'u al
      const dataToSend = {
        courierObjectId, // Kullanıcının ObjectId'si
        latitude,
        longitude
      };
      console.log(dataToSend)
      socket.send(JSON.stringify(dataToSend)); // Hem ObjectId'yi hem de konum bilgilerini gönder
    }
  };
  
  

  return (
    <WebSocketContext.Provider value={{ socket, data, sendLocation }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
