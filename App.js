// App.js
import 'react-native-gesture-handler';
import React, { useState, useContext } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Provider as PaperProvider, Button, Dialog, Portal, Text } from 'react-native-paper';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import OptionsScreen from './screens/OptionsScreen';
import OrderScreen from './screens/OrderScreen';
import { ThemeContext, ThemeProvider } from './contexts/ThemeContext';
import { Image } from 'react-native';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider, useWebSocket } from './contexts/WebSocketProvider'; // WebSocketProvider ve useWebSocket eklenmiş

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const optionsIcon = require('./assets/hamburgerMenu/optionsIcon.png');
const optionsDarkIcon = require('./assets/hamburgerMenu/optionsDarkModeIcon.png');
const deliveryIcon = require('./assets/hamburgerMenu/deliveryIcon.png');
const deliveryDarkIcon = require('./assets/hamburgerMenu/deliveryDarkModeIcon.png');
const packetIcon = require('./assets/hamburgerMenu/packetIcon.png');
const packetDarkIcon = require('./assets/hamburgerMenu/packetDarkModeIcon.png');

const App = () => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <ThemeProvider>
          <PaperProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen} 
                  options={{ headerShown: false }} 
                />
                <Stack.Screen 
                  name="Main" 
                  component={DrawerNavigator} 
                  options={{ headerShown: false }} 
                />
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
};

// Drawer Navigator bileşeni
const DrawerNavigator = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const drawerBackgroundColor = isDarkMode ? '#333' : '#fff';
  const drawerLabelColor = isDarkMode ? '#fff' : '#000';
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleLogout = () => {
    hideDialog();
    navigation.navigate('Login');
  };

  return (
    <>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerStyle: {
            backgroundColor: drawerBackgroundColor,
          },
          drawerActiveTintColor: drawerLabelColor,
          drawerInactiveTintColor: drawerLabelColor,
        }}
      >
        <Drawer.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: drawerBackgroundColor },
            headerTintColor: drawerLabelColor,
            headerTitle: 'Ana Sayfa',
            drawerLabel: 'Ana Sayfa',
            drawerIcon: ({ color }) => (
              <Image source={isDarkMode ? deliveryDarkIcon : deliveryIcon} style={{ width: 20, height: 20, tintColor: color }} />
            ),
            headerRight: () => (
              <Button onPress={showDialog} textColor='red'>
                Çıkış Yap
              </Button>
            ),
          }} 
        />
        <Drawer.Screen
          name="Orders"
          component={OrderScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: drawerBackgroundColor },
            headerTintColor: drawerLabelColor,
            headerTitle: 'Siparişler',
            drawerLabel: 'Siparişler',
            drawerIcon: ({ color }) => (
              <Image source={isDarkMode ? packetDarkIcon : packetIcon} style={{ width: 20, height: 20, tintColor: color }} />
            ),
            headerRight: () => (
              <Button onPress={showDialog} textColor='red'>
                Çıkış Yap
              </Button>
            ),
          }}
        />
        <Drawer.Screen 
          name="Options" 
          component={OptionsScreen} 
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: drawerBackgroundColor },
            headerTintColor: drawerLabelColor,
            headerTitle: 'Ayarlar',
            drawerLabel: 'Ayarlar',
            drawerIcon: ({ color }) => (
              <Image source={isDarkMode ? optionsDarkIcon : optionsIcon} style={{ width: 20, height: 20, tintColor: color }} />
            ),
            headerRight: () => (
              <Button onPress={showDialog} textColor='red' style={{ fontWeight: 'bold' }}>
                Çıkış Yap
              </Button>
            ),
          }}
        />
      </Drawer.Navigator>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog} style={{ backgroundColor: isDarkMode ? '#333' : '#fff' }}>
          <Dialog.Title style={{ color: isDarkMode ? '#fff' : '#000' }}>Hesaptan Çıkış</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Hesaptan çıkmak istediğinize emin misiniz?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog} color={drawerLabelColor}>İptal</Button>
            <Button onPress={handleLogout} color={drawerLabelColor}>Çıkış Yap</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};


export default App;
