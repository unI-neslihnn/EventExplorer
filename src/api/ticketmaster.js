// src/api/ticketmaster.js
import axios from 'axios';

// ⚠️ BURAYA KENDİ TICKETMASTER API KEY'İNİ YAZ
const API_KEY = 'Q4bzYNVvjJOp0nRYDoiMUnw2RGGm9k6U'; 
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

// Bugünün tarihini ISO formatında alır (Örn: 2026-08-06T00:00:00Z)
const getTodayISOString = () => {
  const now = new Date();
  return now.toISOString().split('.')[0] + 'Z';
};

// 1. Şehre ve Anahtar Kelimeye Göre Etkinlik Çekme (Güncel Etkinlikler)
export const fetchEventsByCity = async (city = 'New York', keyword = '') => {
  try {
    const params = {
      apikey: API_KEY,
      city: city,
      sort: 'date,asc',
      startDateTime: getTodayISOString(),
      size: 20,
    };

    if (keyword && keyword.trim() !== '') {
      params.keyword = keyword.trim();
    }

    const response = await axios.get(BASE_URL, { params });
    return response.data._embedded ? response.data._embedded.events : [];
  } catch (error) {
    console.error('Error fetching events by city:', error?.response?.data || error.message);
    return [];
  }
};

// 2. Konuma (GPS Lat/Lon) Göre Etkinlik Çekme (Güncel Etkinlikler)
export const fetchEventsByLocation = async (lat, lon, radius = '50') => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apikey: API_KEY,
        latlong: `${lat},${lon}`,
        radius: radius,
        unit: 'km',
        sort: 'date,asc',
        startDateTime: getTodayISOString(),
        size: 20,
      },
    });

    return response.data._embedded ? response.data._embedded.events : [];
  } catch (error) {
    console.error('Error fetching events by location:', error?.response?.data || error.message);
    return [];
  }
};