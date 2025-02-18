import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext'; // AuthContext'i içe aktar

const LoginScreen = () => {
  const [nickname, setNickname] = useState(''); // nickname yerine username kullanımı düzeltildi
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    const response = await login(nickname, password); // login fonksiyonunun döndürdüğü nesneyi alıyoruz
    if (response.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }], // Ana ekrana yönlendirir
      });
    } else {
      Alert.alert('Hata', response.message); // Hata mesajını gösteriyoruz
    }
  };

  return (
    <LinearGradient
      colors={['#354767', '#356755']}
      style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/logo/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Kurye Giriş</Text>
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          value={nickname}
          onChangeText={setNickname}
          keyboardType="default"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Kurye Şifre"
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={!showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="grey"
            />
          </TouchableOpacity>
        </View>
        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          Giriş Yap
        </Button>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    marginBottom: 20,
    backgroundColor: '#D2A07A',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    height: '100%',
    borderRadius: 8,
  },
  eyeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default LoginScreen;
