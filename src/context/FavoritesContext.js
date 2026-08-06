// src/context/FavoritesContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FavoritesContext = createContext();

const STORAGE_KEY = '@event_explorer_favorites';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Uygulama ilk açıldığında kaydedilen favorileri yükle
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
    }
  };

  // Favorilere etkinlik ekle
  const addFavorite = async (event) => {
    try {
      if (!favorites.some((fav) => fav.id === event.id)) {
        const updatedFavorites = [...favorites, event];
        setFavorites(updatedFavorites);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Favori ekleneceği sırada hata:', error);
    }
  };

  // Favorilerden etkinlik çıkar
  const removeFavorite = async (eventId) => {
    try {
      const updatedFavorites = favorites.filter((item) => item.id !== eventId);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Favori silinirken hata:', error);
    }
  };

  // Etkinliğin favorilerde olup olmadığını kontrol et
  const isFavorite = (eventId) => {
    return favorites.some((item) => item.id === eventId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};