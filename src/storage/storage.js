
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ShowMate:library';

export async function saveLibrary(library) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(library)
    );
  } catch (error) {
    console.log('Erro ao salvar biblioteca:', error);
  }
}

export async function loadLibrary() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('Erro ao carregar biblioteca:', error);
    return [];
  }
}
