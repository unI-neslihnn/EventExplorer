// src/screens/FavoritesScreen.js
import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
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
};

export default function FavoritesScreen({ navigation }) {
  const { favorites, removeFavorite } = useContext(FavoritesContext);

  const renderFavoriteItem = ({ item }) => {
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
          <View style={styles.cardHeaderRow}>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-outline" size={14} color={THEME.white} />
              <Text style={styles.dateText}>{eventDate}</Text>
            </View>

            {/* Favorilerden Çıkar Butonu */}
            <TouchableOpacity onPress={() => removeFavorite(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>

          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.name}
          </Text>

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
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Saved Events</Text>
        </View>

        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={56} color={THEME.secondary} />
            <Text style={styles.emptyTitle}>No Saved Events</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any event detail to save it here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderFavoriteItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}

      </View>
    </SafeAreaView>
  );
}

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
    marginBottom: 16,
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
    height: 150,
  },
  cardContent: {
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.primary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.secondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});