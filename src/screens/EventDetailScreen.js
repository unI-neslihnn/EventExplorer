// src/screens/EventDetailScreen.js
import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { FavoritesContext } from '../context/FavoritesContext';

// --- THEME COLOR PALETTE ---
const THEME = {
  primary: '#0C5E8A',     // Inkwell
  secondary: '#5D9CBD',   // Fresh Water
  accent: '#798C5E',      // Nourish
  border: '#798C5E',      
  bgLightGreen: '#EFEFE6',// Soft Background
  white: '#FFFFFF',
  textDark: '#2D3436',
};

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const { addFavorite, removeFavorite, isFavorite } = useContext(FavoritesContext);
  const favorited = isFavorite(event.id);

  const toggleFavorite = () => {
    if (favorited) {
      removeFavorite(event.id);
    } else {
      addFavorite(event);
    }
  };

  const imageUrl = event.images && event.images.length > 0 ? event.images[0].url : null;
  const eventDate = event.dates?.start?.localDate || 'N/A';
  const eventTime = event.dates?.start?.localTime || '';
  const venue = event._embedded?.venues?.[0];
  const venueName = venue?.name || 'Unknown Venue';
  const venueAddress = venue?.address?.line1 || 'Address not available';
  const venueCity = venue?.city?.name || '';
  const priceRange = event.priceRanges?.[0]
    ? `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}`
    : 'Price info unavailable';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Top Image Card: Rounded Corners with Margins */}
        <View style={styles.imageWrapper}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <Text style={styles.noImageText}>No Image Available</Text>
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={THEME.primary} />
          </TouchableOpacity>

          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={24}
              color={favorited ? '#e74c3c' : THEME.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Details Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{event.name}</Text>

          {/* Date & Time */}
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={THEME.accent} />
            <Text style={styles.infoText}>
              {eventDate} {eventTime ? `at ${eventTime}` : ''}
            </Text>
          </View>

          {/* Ticket Price */}
          <View style={styles.infoRow}>
            <Ionicons name="ticket-outline" size={20} color={THEME.accent} />
            <Text style={styles.infoText}>{priceRange}</Text>
          </View>

          {/* Venue Card */}
          <View style={styles.venueCard}>
            <View style={styles.venueHeader}>
              <Ionicons name="location" size={22} color={THEME.primary} />
              <Text style={styles.venueTitle}>{venueName}</Text>
            </View>
            <Text style={styles.venueAddress}>
              {venueAddress} {venueCity ? `, ${venueCity}` : ''}
            </Text>
          </View>

          {/* Classification Badge */}
          {event.classifications?.[0] && (
            <View style={styles.genreBadge}>
              <Text style={styles.genreText}>
                {event.classifications[0].segment?.name} / {event.classifications[0].genre?.name}
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bgLightGreen,
  },
  container: {
    paddingBottom: 30,
  },
  imageWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 230,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    backgroundColor: THEME.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: THEME.white,
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: THEME.white,
    padding: 10,
    borderRadius: 20,
    elevation: 5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: THEME.white,
    padding: 10,
    borderRadius: 20,
    elevation: 5,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: THEME.textDark,
    marginLeft: 10,
    fontWeight: '500',
  },
  venueCard: {
    backgroundColor: THEME.white,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginVertical: 14,
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  venueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.primary,
    marginLeft: 6,
  },
  venueAddress: {
    fontSize: 13,
    color: THEME.secondary,
    marginLeft: 28,
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  genreText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});