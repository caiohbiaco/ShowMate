import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MovieCard from '../components/MovieCard';

export default function LibraryScreen() {
  const [titulo, setTitulo] = useState('');
  const [ano, setAno] = useState('');
  const [erro, setErro] = useState('');
  const [lista, setLista] = useState([]);

  function adicionar() {
    if (titulo.trim().length < 2) {
      setErro('Digite um título com pelo menos 2 letras.');
      return;
    }

    if (ano.length !== 4 || isNaN(ano)) {
      setErro('Digite um ano válido, com 4 números.');
      return;
    }

    const novoItem = {
      id: Date.now().toString(),
      title: titulo.trim(),
      type: 'filme',
      year: ano,
      genre: 'Adicionado por você',
    };

    setLista([...lista, novoItem]);
    setTitulo('');
    setAno('');
    setErro('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Biblioteca</Text>

      <TextInput
        style={styles.input}
        placeholder="Título"
        placeholderTextColor="#94A3B8"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={styles.input}
        placeholder="Ano (ex: 2014)"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        maxLength={4}
        value={ano}
        onChangeText={setAno}
      />

      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

      <Pressable style={styles.button} onPress={adicionar}>
        <Text style={styles.buttonText}>Adicionar</Text>
      </Pressable>

      <FlatList
        data={lista}
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
    marginTop: 12,
  },

  erro: {
    color: '#F87171',
    fontSize: 14,
    marginTop: 10,
  },

  button: {
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },

  buttonText: {
    color: '#101820',
    fontSize: 16,
    fontWeight: 'bold',
  },
});