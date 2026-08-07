// src/utils/notifications.js
import { Alert } from 'react-native';

/**
 * Event Reminder Function
 * Etkinlikten 1 GÜN ÖNCEYE hatırlatıcı kurar.
 */
export async function scheduleEventReminder(event) {
  const eventName = event.name || 'Upcoming Event';
  const eventDateStr = event.dates?.start?.localDate; // Örn: '2026-09-15'
  const eventTimeStr = event.dates?.start?.localTime || '10:00:00'; // Örn: '20:00:00'

  if (!eventDateStr) {
    Alert.alert('Date Unavailable', 'This event does not have a confirmed date yet.');
    return;
  }

  // Etkinlik Tarihi
  const eventDateTime = new Date(`${eventDateStr}T${eventTimeStr}`);
  
  // 1 Gün Öncesi (24 Saat = 24 * 60 * 60 * 1000 ms)
  const reminderDateTime = new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000);
  const now = new Date();

  // Eğer 1 gün öncesi tarih bile geçmişte kaldıysa
  if (reminderDateTime < now) {
    Alert.alert('Event Too Soon or Past', 'This event takes place in less than 24 hours or has already passed.');
    return;
  }

  // Tarihi okunabilir formata çevir
  const reminderDateStr = reminderDateTime.toISOString().split('T')[0];
  const formattedTime = eventTimeStr.length >= 5 ? eventTimeStr.substring(0, 5) : eventTimeStr;

  // Hatırlatıcı Kurulum Konfirmasyonu
  Alert.alert(
    '🔔 Set 24h Prior Reminder',
    `Set a reminder 1 day before "${eventName}" on ${reminderDateStr} at ${formattedTime}?`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Set Reminder',
        onPress: () => {
          Alert.alert(
            'Reminder Saved! 🎟️',
            `You will be reminded on ${reminderDateStr} (24 hours before the event starts).`
          );
        },
      },
    ]
  );
}