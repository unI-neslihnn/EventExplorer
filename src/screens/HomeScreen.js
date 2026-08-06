// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// API services
import { fetchEventsByCity, fetchEventsByLocation } from '../api/ticketmaster';

// --- THEME COLOR PALETTE ---
const THEME = {
  primary: '#0C5E8A',     // Inkwell (Main Dark Blue)
  secondary: '#5D9CBD',   // Fresh Water (Light Blue)
  accent: '#798C5E',      // Nourish (Olive Green)
  border: '#798C5E',      // Border
  bgLightGreen: '#EFEFE6',// Soft Pastel Background
  white: '#FFFFFF',
  textDark: '#2D3436',
};

export default function HomeScreen({ navigation }) {
  const [city, setCity] = useState('New York');
  const [keyword, setKeyword] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load default events on initial mount
  useEffect(() => {
    loadCityEvents();
  }, []);

  // Fetch events by city & keyword
  const loadCityEvents = async () => {
    setLoading(true);
    const data = await fetchEventsByCity(city, keyword);
    setEvents(data);
    setLoading(false);
  };

  // Robust GPS Location Fetcher with Fallback Strategy
  const handleNearbyEvents = async () => {
    setLoading(true);
    try {
      // 1. Request Permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location access is needed to find nearby events. Please enable it in settings.'
        );
        setLoading(false);
        return;
      }

      let lat = null;
      let lon = null;

      // 2. Try fetching fresh GPS location
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = currentLocation.coords.latitude;
        lon = currentLocation.coords.longitude;
      } catch (gpsErr) {
        console.warn('Live GPS timed out, trying last known position:', gpsErr);
        // Fallback A: Try last known location
        const lastLocation = await Location.getLastKnownPositionAsync();
        if (lastLocation?.coords) {
          lat = lastLocation.coords.latitude;
          lon = lastLocation.coords.longitude;
        }
      }

      // Fallback B: Default coordinates if emulator GPS is disconnected
      if (!lat || !lon) {
        lat = 40.7128;
        lon = -74.0060;
        Alert.alert(
          'GPS Signal Weak',
          'Using default location (New York) to show sample nearby events.'
        );
      }

      // 3. Query Ticketmaster API with coordinates
      const data = await fetchEventsByLocation(lat, lon);

      if (data && data.length > 0) {
        setEvents(data);
      } else {
        Alert.alert('No Events Nearby', 'No events found for your current location.');
      }
    } catch (error) {
      console.error('Error fetching nearby events:', error);
      Alert.alert('Location Error', 'Unable to retrieve nearby events right now.');
    } finally {
      setLoading(false);
    }
  };

  // Render event item card
  const renderEventItem = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0 ? item.images[0].url : null;
    const eventDate = item.dates?.start?.localDate || 'N/A';
    const venueName = item._embedded?.venues?.[0]?.name || 'Unknown Venue';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
      >
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.cardImage} />}
        
        <View style={styles.cardContent}>
          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={14} color={THEME.white} />
            <Text style={styles.dateText}>{eventDate}</Text>
          </View>

          {/* Event Title */}
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Location Info */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={THEME.secondary} />
            <Text style={styles.venueText} numberOfLines={1}>
              {venueName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Event Explorer</Text>
        </View>

        {/* Search Container */}
        <View style={styles.searchContainer}>
          <View style={styles.inputRow}>
            <Ionicons name="business-outline" size={20} color={THEME.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="City (e.g., London, Chicago)..."
              placeholderTextColor={THEME.secondary}
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="search-outline" size={20} color={THEME.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search Event or Artist..."
              placeholderTextColor={THEME.secondary}
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.searchButton} onPress={loadCityEvents}>
              <Ionicons name="search" size={16} color={THEME.white} />
              <Text style={styles.buttonText}>Find Events</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.locationButton} onPress={handleNearbyEvents}>
              <Ionicons name="navigate" size={16} color={THEME.white} />
              <Text style={styles.buttonText}>Near Me</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List / Loading / Empty States */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingText}>Fetching events...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={THEME.secondary} />
            <Text style={styles.emptyText}>No events found.</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={renderEventItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}

      </View>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bgLightGreen,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.secondary,
    marginTop: 4,
  },
  searchContainer: {
    backgroundColor: THEME.white,
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgLightGreen,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 42,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: THEME.textDark,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchButton: {
    flex: 1,
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 6,
  },
  locationButton: {
    flex: 1,
    backgroundColor: THEME.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 6,
  },
  buttonText: {
    color: THEME.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.border,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 14,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.accent,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueText: {
    fontSize: 13,
    color: THEME.secondary,
    marginLeft: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: THEME.primary,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 10,
    color: THEME.secondary,
    fontSize: 16,
  },
});