import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Platform, StyleSheet, View, Text, TouchableOpacity, Linking, Alert, BackHandler, FlatList, Modal } from 'react-native';
import * as Location from 'expo-location';
import { ThemeContext } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { AuthContext } from '../contexts/AuthContext';
import MapComponent from '../components/MapComponent';
import { useWebSocket } from '../contexts/WebSocketProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const HomeScreen = ({ navigation }) => {
  const { isDarkMode, headerColor } = useContext(ThemeContext);
  const { sendLocation } = useWebSocket();
  const [isEnabled, setIsEnabled] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [orderPicked, setOrderPicked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isBreakModalVisible, setIsBreakModalVisible] = useState(false);
  const { user } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState([]);
  const [isOnWay, setIsOnWay] = useState(false);
  const [orders, setOrders] = useState([]);


  const activeOrders = user.orders.filter(order => order.status === 'Aktif Sipariş');

    // Tüm kuryeleri API'dan yükle
    const loadRestaurantsAndOrders = async () => {
      try {
        setRestaurant(user.restaurantID);
        setOrders(user.orders)
      } catch (error) {
        console.error("Restoranları yükleme hatası:", error);
      }
    };

    // WebSocket ile gönderilecek veriyi düzenle
    useEffect(() => {
      if (currentLocation && user?._id) {
        // Hem currentLocation hem de objectId'yi gönder
        sendLocation(currentLocation, user._id); // İki parametre gönder
      }
    }, [currentLocation, user]);

  
    const formatDate = (dateString) => {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Istanbul',
      };
      const formatter = new Intl.DateTimeFormat('tr-TR', options);
      return formatter.format(new Date(dateString));
    };
    

    useEffect(() => {
      const initializeData = async () => {
        await loadRestaurantsAndOrders(); // Tüm kuryeleri yükle
      };
      initializeData();
    }, []);

  const renderItem = ({ item }) => (
    <View
      style={[styles.orderCard, { backgroundColor: item.status === 'Aktif Sipariş' ? 'green' : isDarkMode ? '#000' : '#fff' }]}
    >
      <Text style={[styles.orderText, { color: isDarkMode || item.status === 'Aktif Sipariş' ? '#fff' : '#000' }]}>Restoran: {restaurant.name}</Text>
      <Text style={[styles.orderText, { color: isDarkMode || item.status === 'Aktif Sipariş' ? '#fff' : '#000' }]}>Müşteri: {item.customer}</Text>
      <Text style={[styles.orderText, { color: isDarkMode || item.status === 'Aktif Sipariş' ? '#fff' : '#000' }]}>Durum: {item.status}</Text>
      <Text style={[styles.orderText, { color: isDarkMode || item.status === 'Aktif Sipariş' ? '#fff' : '#000' }]}>Tarih: {formatDate(item.date)}</Text>
    </View>
  );

  const handlePress = () => {
    // Mola başlatma
    setIsDisabled(true);
    setTimeLeft(30 * 60); // 30 dakika = 1800 saniye
    setIsBreakModalVisible(true);

    // Interval oluşturma
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        // Süre 1 saniyeye ulaştığında ve hatta geçtikten sonra durdurma
        if (prev <= 1) {
          clearInterval(interval); // Intervali temizle
          setIsDisabled(false);
          setIsBreakModalVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Her 1000 milisaniyede bir güncelle
  };
  
  useEffect(() => {
    let interval;
    const startInterval = () => {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          // Süre 1 saniyeye ulaştığında ve hatta geçtikten sonra durdurma
          if (prev <= 1) {
            clearInterval(interval); // Intervali temizle
            setIsDisabled(false);
            setIsBreakModalVisible(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Her 1000 milisaniyede bir güncelle
    };

    if (timeLeft > 0) {
      startInterval();
    }

    // Cleanup işlevi
    return () => {
      clearInterval(interval);
    };
  }, [timeLeft]);
  
  
  
  useEffect(() => {
    if (timeLeft === 0) {
      setIsDisabled(false);
    }
  }, [timeLeft]);


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  

  useEffect(() => {
    let subscription;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 100, distanceInterval: 10 },
        (location) => {
          setCurrentLocation(location.coords);
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (currentLocation) {
      navigation.setOptions({
        title: 'Kurye Programı',
        color: '#fff',
        backgroundColor: headerColor,
        headerRight: () => (
          <TouchableOpacity onPress={() => initializeData()}>
            <Icon name="refresh" size={24} color="red" style={{ marginRight: 10 }} />
          </TouchableOpacity>
        ),
      });
    }

    const onBackPress = () => {
      Alert.alert(
        'Hesaptan Çıkış',
        'Hesaptan çıkmak istediğinize emin misiniz?',
        [
          {
            text: 'Hayır',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Evet',
            onPress: () => navigation.navigate('Login'),
          },
        ],
        { cancelable: false }
      );
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [currentLocation, navigation, headerColor]);

  // initializeData fonksiyonunu sayfa yenilemek için kullanıyoruz
  const initializeData = async () => {
    await loadRestaurantsAndOrders();
  };

  const openDirections = (restaurantLocation, customerLocations) => {
    // Restoranı başlangıç noktası ve müşteri konumlarını duraklar olarak belirle
    const waypoints = customerLocations
      .map(location => `${location.latitude},${location.longitude}`)
      .join('|');
    
    // URL'yi oluşturun
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${restaurantLocation.latitude},${restaurantLocation.longitude}&waypoints=${waypoints}`,
      android: `https://www.google.com/maps/dir/?api=1&origin=${restaurantLocation.latitude},${restaurantLocation.longitude}&waypoints=${waypoints}&destination=${customerLocations[customerLocations.length - 1].latitude},${customerLocations[customerLocations.length - 1].longitude}`,
    });
  
    // URL'yi açın
    Linking.openURL(url);
  };

  // Bottom Sheet referansı
  const bottomSheetRef = useRef(null);
    // callbacks
    const handleSheetChanges = useCallback((index) => {
      console.log('handleSheetChanges', index);
    }, []);
  // Snap Point'leri belirleyin
  const snapPoints = ['25%', '60%', '90%'];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>


      <GestureHandlerRootView style={styles.container}>
      {currentLocation && (
        <MapComponent
          currentLocation={currentLocation}
          restaurant={restaurant}
          activeOrders={activeOrders}
          isEnabled={isEnabled}
        />
      )}
      <BottomSheet
        ref={bottomSheetRef}
        index={0} 
        snapPoints={snapPoints}
        animateOnMount={true} 
        backgroundStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff' }}
      >
        <BottomSheetView style={styles.contentContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#03a9fc' }]}
            onPress={() => setOrderPicked(true)}
          >
            <Text style={styles.buttonText}>Sipariş Alındı</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#E91E63' }]}
          >
            <Text style={styles.buttonText}>Sipariş Verildi</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#007BFF' }]}
            onPress={() => {
              // Müşteri konumlarını liste olarak oluşturun
              const customerLocations = activeOrders.map(order => order.customerLocation);
        
              // Yönlendirme fonksiyonunu çağırın
              openDirections(restaurant.restaurantLocation, customerLocations);
            }}
          >
            <Text style={styles.buttonText}>Siparişi Al ve Müşteriye Götür</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.ordersHeader, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
          <Text style={[styles.ordersHeaderText, { color: isDarkMode ? '#fff' : '#000' }]}>Aktif Siparişler</Text>
          <TouchableOpacity
            style={[styles.previousOrdersButton, { backgroundColor: isDarkMode ? 'black' : '#f5f5f5' }]}
            onPress={() => navigation.navigate('Orders')}
          >
            <Icon name="time-outline" size={20} color={isDarkMode ? '#fff' : '#000'} />
            <Text style={[styles.previousOrdersButtonText, { color: isDarkMode ? '#fff' : '#000' }]}>Önceki Siparişler</Text>
          </TouchableOpacity>
        </View>
        </BottomSheetView>
        <View style={[styles.flatListContainer]}>
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 0 }}
            scrollEnabled={true}
          />
        </View>
      </BottomSheet>
      </GestureHandlerRootView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',  // Daha açık bir arka plan rengi
  },
  markerImage: {
    width: 50,
    height: 50,
  },
  motorcycleMarkerImage: {
    width: 40,
    height: 40,
  },
  map: {
    height: '40%',
    width: '100%',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    padding: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderCard: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',  // Koyu gölge rengi
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  orderText: {
    fontSize: 14,
    color: '#333',  // Koyu gri metin rengi
  },
  flatListContainer: {
    flex: 1, // FlatList'in tüm yüksekliği kaplamasını sağlar
    marginHorizontal: 20,
    maxHeight: '60%',
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',  // Beyaz arka plan
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  ordersHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',  // Koyu gri başlık rengi
  },
  previousOrdersButton: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#007BFF',  // Mavi arka plan rengi
  },
  previousOrdersButtonText: {
    marginLeft: 5,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  breakButton: {
    padding: 20,
    alignItems: 'center',
    marginVertical: 10, // Butonun etrafında boşluk bırakın
    marginHorizontal: 20, // Butonun yatayda ortalanmasını sağlar
    backgroundColor: '#C62828',  // Dikkat çekici kırmızı
    borderRadius: 10, // Kenarları yuvarlat
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Yarı şeffaf arka plan
  },
  modalContent: {
    width: '80%', // Modal genişliği
    maxHeight: '40%', // Modal yüksekliği
    padding: 20,
    backgroundColor: '#fff', // Modal arka plan rengi
    borderRadius: 10, // Kenarları yuvarlat
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeModalButton: {
    padding: 10,
    backgroundColor: '#C62828',
    borderRadius: 5,
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
