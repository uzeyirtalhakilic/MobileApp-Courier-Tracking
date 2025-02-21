import React, { useContext, useEffect, useState } from 'react';
import { Platform, Image, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { ThemeContext } from '../contexts/ThemeContext';

const OPENROUTESERVICE_APIKEY = '5b3ce3597851110001cf6248f70fa3413a8041af951c0837fb0bdf6e'; // OpenRouteService API anahtarınızı buraya ekleyin

const restaurantMarkerImage = require('../assets/markers/restaurantMarker.png');
const motorcyleMarkerImage = require('../assets/markers/motorcycleMarker.png');
const customerMarkerImage = require('../assets/markers/customerMarker.png');
const customerDarkModeMarkerImage = require('../assets/markers/customerDarkModeMarker.png');

const MapComponent = ({
  currentLocation,
  restaurant,
  activeOrders,
  isEnabled,
}) => {
  // const [restaurantRouteCoordinates, setRestaurantRouteCoordinates] = useState([]);
  // const [customerRoutesCoordinates, setCustomerRoutesCoordinates] = useState([]);


const routeCache = new Map();

const fetchRoute = async (origin, destination) => {
  const cacheKey = `${origin.latitude},${origin.longitude}-${destination.latitude},${destination.longitude}`;
  
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${OPENROUTESERVICE_APIKEY}&start=${origin.longitude},${origin.latitude}&end=${destination.longitude},${destination.latitude}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features[0] && data.features[0].geometry) {
      const coordinates = data.features[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0],
      }));

      routeCache.set(cacheKey, coordinates);
      return coordinates;
    } else {
      console.error('API yanıtı beklenen formatta değil:', data);
      return [];
    }
  } catch (error) {
    console.error('Rota alma hatası:', error);
    return [];
  }
};
  

  // const calculateRoutes = async () => {
  //   if (!restaurant || !activeOrders.length || !currentLocation) return;

  //   // Restorana olan rota
  //   const restaurantRoute = await fetchRoute(currentLocation, restaurant.restaurantLocation);
  //   setRestaurantRouteCoordinates(restaurantRoute);

  //   // Müşterilere olan rotalar
  //   let previousLocation = restaurant.restaurantLocation;
  //   let allCustomerRoutes = [];

  //   const sortedOrders = activeOrders.sort((a, b) => {
  //     const distA = Math.hypot(restaurant.restaurantLocation.latitude - a.customerLocation.latitude, restaurant.restaurantLocation.longitude - a.customerLocation.longitude);
  //     const distB = Math.hypot(restaurant.restaurantLocation.latitude - b.customerLocation.latitude, restaurant.restaurantLocation.longitude - b.customerLocation.longitude);
  //     return distA - distB;
  //   });

  //   for (let order of sortedOrders) {
  //     const customerRoute = await fetchRoute(previousLocation, order.customerLocation);
  //     allCustomerRoutes = allCustomerRoutes.concat(customerRoute);
  //     previousLocation = order.customerLocation;
  //   }

  //   setCustomerRoutesCoordinates(allCustomerRoutes);
  // };

  // useEffect(() => {
  //   calculateRoutes();
  // }, [currentLocation, restaurant, activeOrders]);

  const markers = [
    {
      lat: restaurant.restaurantLocation?.latitude || 0,
      long: restaurant.restaurantLocation?.longitude || 0,
      title: 'Restoran',
      key: 'Restoran'
    },
    ...activeOrders.map(order => ({
      lat: order.customerLocation.latitude,
      long: order.customerLocation.longitude,
      title: `Müşteri: ${order.customer}`,
      key: 'Müşteri'
    }))
  ];

  return (
    <MapView
      provider={MapView.PROVIDER_OSM}
      style={styles.map}
      initialRegion={{
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.1,
      }}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          title={marker.title}
          coordinate={{ latitude: marker.lat, longitude: marker.long }}
        >
          {marker.key === 'Restoran' && (
            <Image
              source={restaurantMarkerImage}
              style={styles.markerImage}
              resizeMode="contain"
            />
          )}
          {marker.key === 'Müşteri' && (
            <Image
              source={isEnabled ? customerMarkerImage : customerDarkModeMarkerImage}
              style={styles.markerImage}
              resizeMode="contain"
            />
          )}
        </Marker>
      ))}

      {/* {restaurantRouteCoordinates.length > 0 && (
        <Polyline
          coordinates={restaurantRouteCoordinates}
          strokeWidth={5}
          strokeColor="red" // Restorana olan rota için kırmızı renk
        />
      )}

      {customerRoutesCoordinates.length > 0 && (
        <Polyline
          coordinates={customerRoutesCoordinates}
          strokeWidth={5}
          strokeColor={isEnabled ? '#03A9FC' : '#8BC34A'} // Müşteri rotaları için diğer renkler
        />
      )} */}

      <Marker
        title="Bulunduğun Konum"
        coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
      >
        <Image
          source={motorcyleMarkerImage}
          style={styles.motorcycleMarkerImage}
          resizeMode="contain"
        />
      </Marker>
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    height: '100%',
    width: '100%',
    flex: 1,
  },
  markerImage: {
    width: 50,
    height: 50,
  },
  motorcycleMarkerImage: {
    width: 40,
    height: 40,
  },
});

export default MapComponent;
