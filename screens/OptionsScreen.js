import React, { useContext } from 'react';
import { View, Text, StyleSheet, BackHandler, Switch, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext'; // AuthContext'i içe aktar

const OptionsScreen = () => {
  const { isDarkMode, toggleTheme, headerColor } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext); // AuthContext'ten logout fonksiyonunu al
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true;  // Geri tuşunun varsayılan işlevini durdur
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  );

  const handleLogout = async () => {
    try {
      navigation.navigate('Login'); // Giriş ekranına yönlendir
    } catch (error) {
      console.error('Çıkış işlemi sırasında bir hata oluştu:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <Text style={[styles.text, { color: headerColor }]}>Options Screen</Text>
      <View style={styles.optionContainer}>
        <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#333' }]}>Dark Mode</Text>
        <Switch
          trackColor={{ false: "#000", true: "#fff" }}
          thumbColor={isDarkMode ? "#fff" : "#000"}
          onValueChange={toggleTheme}
          value={isDarkMode}
        />
      </View>
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#555' : '#ddd' }]} 
        onPress={handleLogout}
      >
        <Text style={[styles.logoutButtonText, { color: isDarkMode ? '#fff' : '#000' }]}>Log Out</Text>
      </TouchableOpacity>
      <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#333' }]}>Mehel Ar-Ge ve Otomasyon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  optionText: {
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
  },
});

export default OptionsScreen;
