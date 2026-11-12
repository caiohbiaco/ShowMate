
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERIES_PROGRESS_KEY = '@ShowMate:seriesProgress';

export async function loadSeriesProgress() {
  try {
    const data = await AsyncStorage.getItem(SERIES_PROGRESS_KEY);

    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.log('Erro ao carregar progresso das séries:', error);
    return {};
  }
}

export async function saveSeriesProgress(progress) {
  try {
    await AsyncStorage.setItem(
      SERIES_PROGRESS_KEY,
      JSON.stringify(progress)
    );
  } catch (error) {
    console.log('Erro ao salvar progresso das séries:', error);
  }
}
