
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { loadProfile, saveProfile } from '../storage/profileStorage';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function carregarPerfil() {
      const profile = await loadProfile();
      setName(profile.name || '');
      setPhoto(profile.photo || null);
      setLoading(false);
    }

    carregarPerfil();
  }, []);

  async function escolherFoto() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à galeria para escolher sua foto.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  }

  async function salvarPerfil() {
    if (name.trim().length < 2) {
      Alert.alert(
        'Nome inválido',
        'Digite um nome com pelo menos 2 caracteres.'
      );
      return;
    }

    setSaving(true);

    await saveProfile({
      name: name.trim(),
      photo,
    });

    setSaving(false);
    Alert.alert('Sucesso', 'Seu perfil foi atualizado!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>‹ Voltar</Text>
      </Pressable>

      <Text style={styles.title}>Editar perfil</Text>
      <Text style={styles.subtitle}>
        Personalize suas informações no ShowMate.
      </Text>

      <Pressable onPress={escolherFoto} style={styles.photoContainer}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>+</Text>
          </View>
        )}

        <Text style={styles.changePhoto}>Alterar foto</Text>
      </Pressable>

      <Text style={styles.label}>Nome</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu nome"
        placeholderTextColor="#94A3B8"
        value={name}
        onChangeText={setName}
        maxLength={40}
      />

      <Pressable
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={salvarPerfil}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101820',
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#101820',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 25,
  },
  backText: {
    color: '#38BDF8',
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
  },
  photoContainer: {
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 35,
  },
  photo: {
    width: 125,
    height: 125,
    borderRadius: 63,
  },
  photoPlaceholder: {
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  photoPlaceholderText: {
    color: '#38BDF8',
    fontSize: 42,
  },
  changePhoto: {
    color: '#38BDF8',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#38BDF8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 22,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#101820',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
