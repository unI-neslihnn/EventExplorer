// src/screens/MapScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { fetchEventsByLocation, fetchEventsByCity } from '../api/ticketmaster';

// --- THEME COLOR PALETTE ---
const THEME = {
  primary: '#0C5E8A',     // Inkwell
  secondary: '#5D9CBD',   // Fresh Water
  accent: '#798C5E',      // Nourish
  bgLightGreen: '#EFEFE6',// Soft Background
  white: '#FFFFFF',
  textDark: '#2D3436',
};

export default function MapScreen({ navigation }) {
  // Tüm Dünya Görünümü (Varsayılan Harita Alanı)
  const [region] = useState({
    latitude: 25.0000,
    longitude: 10.0000,
    latitudeDelta: 70.0,
    longitudeDelta: 70.0,
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadMapEvents();
  }, []);

  const loadMapEvents = async () => {
    setLoading(true);
    let allFetchedEvents = [];

    try {
      // 1. Canlı GPS Konumundaki ve Dünya Genelindeki Etkinlikleri Aynı Anda Çek
      const [locationRes, globalRes] = await Promise.allSettled([
        (async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const userLoc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              timeout: 4000,
            });
            return fetchEventsByLocation(userLoc.coords.latitude, userLoc.coords.longitude, '100', 50);
          }
          return [];
        })(),
        fetchEventsByCity('', '', 100), // Dünya genelindeki 100 popüler etkinlik
      ]);

      const nearbyEvents = locationRes.status === 'fulfilled' ? locationRes.value : [];
      const globalEvents = globalRes.status === 'fulfilled' ? globalRes.value : [];

      const merged = [...nearbyEvents, ...globalEvents];

      // Tekrarlanan etkinlik ID'lerini temizle
      allFetchedEvents = Array.from(
        new Map(merged.map((item) => [item.id, item])).values()
      );
    } catch (error) {
      console.warn('Error fetching map events:', error);
    } finally {
      setEvents(allFetchedEvents);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Loading Global & Nearby Events...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={() => setSelectedEvent(null)} // Haritada boş yere basınca pencereyi kapat
      >
        {events.map((event) => {
          const venue = event._embedded?.venues?.[0];
          const latStr = venue?.location?.latitude;
          const lonStr = venue?.location?.longitude;

          if (!latStr || !lonStr) return null;

          const latitude = parseFloat(latStr);
          const longitude = parseFloat(lonStr);

          if (isNaN(latitude) || isNaN(longitude)) return null;

          const isSelected = selectedEvent?.id === event.id;

          return (
            <Marker
              key={event.id}
              coordinate={{ latitude, longitude }}
              pinColor={isSelected ? THEME.accent : THEME.primary}
              onPress={(e) => {
                e.stopPropagation(); // Haritanın boş tıkını engeller
                setSelectedEvent(event);
              }}
            />
          );
        })}
      </MapView>

      {/* --- İĞNEYE TIKLAYINCA AÇILAN KÜÇÜK ETKİNLİK PENCERESİ --- */}
      {selectedEvent && (
        <View style={styles.previewCard}>
          {/* Kapat Butonu */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setSelectedEvent(null)}
          >
            <Ionicons name="close-circle" size={22} color={THEME.secondary} />
          </TouchableOpacity>

          <View style={styles.cardRow}>
            {/* Görsel */}
            {selectedEvent.images && selectedEvent.images[0]?.url ? (
              <Image
                source={{ uri: selectedEvent.images[0].url }}
                style={styles.cardImage}
              />
            ) : (
              <View style={[styles.cardImage, styles.noImage]}>
                <Ionicons name="image-outline" size={24} color={THEME.white} />
              </View>
            )}

            {/* Bilgiler */}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {selectedEvent.name}
              </Text>

              <View style={styles.infoLine}>
                <Ionicons name="calendar-outline" size={13} color={THEME.accent} />
                <Text style={styles.infoText}>
                  {selectedEvent.dates?.start?.localDate || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoLine}>
                <Ionicons name="location-outline" size={13} color={THEME.secondary} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {selectedEvent._embedded?.venues?.[0]?.name || 'Unknown Venue'}
                </Text>
              </View>

              {/* Detaya Git Butonu */}
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() => navigation.navigate('EventDetail', { event: selectedEvent })}
              >
                <Text style={styles.detailBtnText}>View Details</Text>
                <Ionicons name="chevron-forward" size={14} color={THEME.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  // KÜÇÜK ETKİNLİK PENCERESİ STİLLERİ
  previewCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.accent,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
  },
  noImage: {
    backgroundColor: THEME.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 4,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 11,
    color: THEME.textDark,
    marginLeft: 4,
    fontWeight: '500',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  detailBtnText: {
    color: THEME.white,
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 2,
  },
});