
import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHED_KEY = '@ShowMate:watched';

export async function loadWatched() {
  try {
    const data = await AsyncStorage.getItem(WATCHED_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('Erro ao carregar assistidos:', error);
    return [];
  }
}

export async function addWatched(item) {
  try {
    const current = await loadWatched();

    // Evita adicionar o mesmo filme duas vezes.
    const alreadyExists = current.some(
      (movie) => movie.id === item.id
    );

    if (alreadyExists) {
      return current;
    }

    const updated = [item, ...current];

    await AsyncStorage.setItem(
      WATCHED_KEY,
      JSON.stringify(updated)
    );

    return updated;
  } catch (error) {
    console.log('Erro ao adicionar assistido:', error);
    return [];
  }
}

export async function removeWatched(id) {
  try {
    const current = await loadWatched();

    const updated = current.filter(
      (movie) => movie.id !== id
    );

    await AsyncStorage.setItem(
      WATCHED_KEY,
      JSON.stringify(updated)
    );

    return updated;
  } catch (error) {
    console.log('Erro ao remover assistido:', error);
    return [];
  }
}
