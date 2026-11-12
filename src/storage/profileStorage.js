import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@ShowMate:profile';

export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(profile)
    );
  } catch (error) {
    console.log('Erro ao salvar perfil:', error);
  }
}

export async function loadProfile() {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);

    return data ? JSON.parse(data) : {
      name: '',
      photo: null,
    };
  } catch (error) {
    console.log('Erro ao carregar perfil:', error);

    return {
      name: '',
      photo: null,
    };
  }
}