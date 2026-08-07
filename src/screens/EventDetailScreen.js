// src/screens/EventDetailScreen.js
import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Calendar from 'expo-calendar';

import { FavoritesContext } from '../context/FavoritesContext';
import { scheduleEventReminder } from '../utils/notifications';

// --- THEME COLOR PALETTE ---
const THEME = {
  primary: '#0C5E8A',     // Inkwell
  secondary: '#5D9CBD',   // Fresh Water
  accent: '#798C5E',      // Nourish
  bgLightGreen: '#EFEFE6',// Soft Background
  white: '#FFFFFF',
  textDark: '#2D3436',
};

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const { isFavorite, addFavorite, removeFavorite } = useContext(FavoritesContext);

  const [qrModalVisible, setQrModalVisible] = useState(false);

  const favorite = isFavorite(event.id);

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(event.id);
    } else {
      addFavorite(event);
    }
  };

  // Etkinlik Bilgileri
  const imageUrl = event.images && event.images.length > 0 ? event.images[0].url : null;
  const eventName = event.name || 'Untitled Event';
  const eventDate = event.dates?.start?.localDate || 'TBA';
  const eventTime = event.dates?.start?.localTime || '';
  const venue = event._embedded?.venues?.[0];
  const venueName = venue?.name || 'Unknown Venue';
  const cityName = venue?.city?.name || '';
  const countryName = venue?.country?.name || '';

  // --- TAKVİME EKLEME FONKSİYONU ---
  const handleAddToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Calendar permission is required.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar =
        calendars.find((cal) => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar found on device.');
        return;
      }

      const startDate = new Date(`${eventDate}T${eventTime || '10:00:00'}`);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: eventName,
        startDate: startDate,
        endDate: endDate,
        location: `${venueName}, ${cityName}`,
        notes: 'Added from EventExplorer App',
      });

      Alert.alert('Success 🎉', 'Event successfully added to your device calendar!');
    } catch (error) {
      console.error('Calendar error:', error);
      Alert.alert('Error', 'Could not add event to calendar.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Üst Görsel ve Favori Butonu */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <Ionicons name="image-outline" size={48} color={THEME.white} />
            </View>
          )}

          {/* Geri Butonu */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={THEME.primary} />
          </TouchableOpacity>

          {/* Favori Butonu */}
          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={22}
              color={favorite ? '#E74C3C' : THEME.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Detay Bilgileri Kartı */}
        <View style={styles.contentCard}>
          <Text style={styles.title}>{eventName}</Text>

          {/* Tarih & Saat */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={18} color={THEME.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Date & Time</Text>
              <Text style={styles.infoDetail}>
                {eventDate} {eventTime ? `at ${eventTime}` : ''}
              </Text>
            </View>
          </View>

          {/* Mekan */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={18} color={THEME.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Location</Text>
              <Text style={styles.infoDetail}>
                {venueName}{cityName ? `, ${cityName}` : ''}{countryName ? ` (${countryName})` : ''}
              </Text>
            </View>
          </View>

          {/* Üst Sıra Aksiyon Butonları (QR Code & Takvime Ekleme) */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => setQrModalVisible(true)}
            >
              <Ionicons name="qr-code-outline" size={18} color={THEME.white} />
              <Text style={styles.buttonText}>QR Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.calendarButton}
              onPress={handleAddToCalendar}
            >
              <Ionicons name="calendar" size={18} color={THEME.white} />
              <Text style={styles.buttonText}>Add to Calendar</Text>
            </TouchableOpacity>
          </View>

          {/* Alt Sıra: Real Event Reminder (Hatırlatıcı) Butonu */}
          <TouchableOpacity
            style={styles.reminderButton}
            onPress={() => scheduleEventReminder(event)}
          >
            <Ionicons name="notifications-outline" size={18} color={THEME.white} />
            <Text style={styles.buttonText}>Set Event Reminder</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* --- QR KOD MODAL PENCERESİ --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setQrModalVisible(false)}
            >
              <Ionicons name="close-circle" size={26} color={THEME.secondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>🎫 Digital Pass</Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>
              {eventName}
            </Text>

            <View style={styles.qrContainer}>
              <QRCode
                value={JSON.stringify({
                  id: event.id,
                  name: event.name,
                  date: eventDate,
                })}
                size={180}
                color={THEME.primary}
                backgroundColor={THEME.white}
              />
            </View>

            <Text style={styles.qrFooterText}>
              Scan this pass at the venue entrance.
            </Text>

          </View>
        </View>
      </Modal>
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
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
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
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: THEME.white,
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: THEME.white,
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  contentCard: {
    backgroundColor: THEME.white,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: THEME.accent,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.bgLightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    color: THEME.secondary,
    fontWeight: '600',
  },
  infoDetail: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 8,
  },
  qrButton: {
    flex: 1,
    backgroundColor: THEME.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 6,
  },
  calendarButton: {
    flex: 1,
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 6,
  },
  reminderButton: {
    backgroundColor: THEME.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  buttonText: {
    color: THEME.white,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '82%',
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: THEME.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: THEME.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.bgLightGreen,
    elevation: 2,
    marginBottom: 14,
  },
  qrFooterText: {
    fontSize: 12,
    color: THEME.secondary,
    textAlign: 'center',
  },
});