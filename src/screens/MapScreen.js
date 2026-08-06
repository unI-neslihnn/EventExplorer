// src/screens/MapScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { fetchEventsByLocation } from '../api/ticketmaster';

// --- THEME COLOR PALETTE ---
const THEME = {
  primary: '#0C5E8A',     // Inkwell
  secondary: '#5D9CBD',   // Fresh Water
  accent: '#798C5E',      // Nourish
  bgLightGreen: '#EFEFE6',// Soft Background
  white: '#FFFFFF',
};

export default function MapScreen() {
  const [region, setRegion] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLocationAndEvents();
  }, []);

  const getUserLocationAndEvents = async () => {
    try {
      // Default location fallback: New York (in case Play Services fails or is disconnected)
      let lat = 40.7128;
      let lon = -74.0060;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // Added timeout and accuracy options to prevent Google Play Services freeze
          const userLoc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000,
          });
          lat = userLoc.coords.latitude;
          lon = userLoc.coords.longitude;
        }
      } catch (locError) {
        console.warn('GPS signal issue or Play Services disconnected, using default location:', locError);
      }

      setRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Fetch events around the determined coordinates
      const nearbyEvents = await fetchEventsByLocation(lat, lon);
      setEvents(nearbyEvents);
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Loading Map & Events...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region} showsUserLocation={true}>
        {events.map((event) => {
          const venue = event._embedded?.venues?.[0];
          const lat = parseFloat(venue?.location?.latitude);
          const lon = parseFloat(venue?.location?.longitude);

          if (!lat || !lon) return null;

          return (
            <Marker
              key={event.id}
              coordinate={{ latitude: lat, longitude: lon }}
              title={event.name}
              description={venue?.name || 'Event Venue'}
              pinColor={THEME.primary}
            >
              <Callout style={styles.callout}>
                <Text style={styles.calloutTitle}>{event.name}</Text>
                <Text style={styles.calloutVenue}>{venue?.name}</Text>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgLightGreen,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.bgLightGreen,
  },
  loadingText: {
    marginTop: 10,
    color: THEME.primary,
    fontWeight: '600',
  },
  callout: {
    padding: 6,
    width: 160,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    color: THEME.primary,
  },
  calloutVenue: {
    fontSize: 10,
    color: THEME.secondary,
  },
});