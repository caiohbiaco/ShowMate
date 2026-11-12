import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import MovieCard from '../components/MovieCard';
import { featuredItems } from '../data/mockData';

export default function DiscoverScreen() {
    const [busca, setBusca] = useState('');

  const resultados = featuredItems.filter((item) =>
    item.title.toLowerCase().includes(busca.toLowerCase())
  ); return (
    <View style={styles.container}>
      <Text style={styles.title}>Descobrir</Text>

            <TextInput
        style={styles.input}
        placeholder="Buscar filme ou série..."
        placeholderTextColor="#94A3B8"
        value={busca}
        onChangeText={setBusca}
      />

      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MovieCard
            title={item.title}
            type={item.type}
            year={item.year}
            genre={item.genre}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101820',
    paddingTop: 70,
    paddingHorizontal: 24,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },

    input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 20,
  },
});