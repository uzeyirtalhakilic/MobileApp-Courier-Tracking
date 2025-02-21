import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../contexts/ThemeContext';

//TODO veritabanından çek Çekilecek
const mockOrders = [
  { id: '1', restaurant: 'PizzaPort', customer: 'Üzeyir Talha Kılıç', status: 'Aktif Sipariş', date: '11.07.2024' },
  { id: '2', restaurant: 'Burger King', customer: 'Üzeyir', status: 'Aktif Sipariş', date: '2024-07-02' },
  { id: '3', restaurant: 'Dominos', customer: 'Talha', status: 'Teslim Edildi', date: '2024-07-03' },
  { id: '4', restaurant: 'PizzaPort', customer: 'Kılıç', status: 'Teslim Edildi', date: '11.07.2024' },

];

const OrderScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, headerColor } = useContext(ThemeContext);


  const handlePress = () => {
    navigation.navigate('Home');  // Aktif siparişi HomeScreen'e gönder
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.orderItem, {backgroundColor: item.status === 'Aktif Sipariş' ? 'green' : isDarkMode ? '#000' : '#f5f5f5'}]}
      onPress={handlePress}
    >
      <Text style={[styles.orderText,{ color: isDarkMode || item.status === 'Aktif Sipariş' ? '#fff' : '#000' }]}>Restoran: {item.restaurant}</Text>
      <Text style={[styles.orderText,{ color: isDarkMode || item.status === 'Aktif Sipariş' ? '#fff' : '#000' }]}>Müşteri: {item.customer}</Text>
      <Text style={[styles.orderText,{ color: isDarkMode || item.status === 'Aktif Sipariş' ? '#fff' : '#000' }]}>Durum: {item.status}</Text>
      <Text style={[styles.orderText,{ color: isDarkMode || item.status === 'Aktif Sipariş' ? '#fff' : '#000' }]}>Tarih: {item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container,{ backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <FlatList
        data={mockOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  orderItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  orderText: {
    fontSize: 16,
    color: '#333',
  },
});

export default OrderScreen;
