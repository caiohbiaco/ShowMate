
import { useState, useCallback } from 'react';

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import MovieCard from '../components/MovieCard';

import {
  loadLibrary,
  saveLibrary,
} from '../storage/storage';

const FILTERS = ['Todos', 'Filmes', 'Séries'];

export default function LibraryScreen({ navigation }) {
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function carregarLista() {
        const dadosSalvos = await loadLibrary();

        setLista(dadosSalvos);
        setCarregando(false);
      }

      carregarLista();
    }, [])
  );

  async function remover(item) {
    const atualizada = lista.filter(
      (conteudo) =>
        !(
          conteudo.id === item.id &&
          conteudo.mediaType === item.mediaType
        )
    );

    setLista(atualizada);
    await saveLibrary(atualizada);
  }

  function abrirDetalhes(item) {
    if (!item.mediaType) {
      return;
    }

    navigation.navigate('ContentDetails', {
      item: {
        id: item.id,
        title: item.title,
        name: item.title,
      },
      type: item.mediaType,
    });
  }

  const listaFiltrada = lista.filter((item) => {
    if (filtro === 'Filmes') {
      return item.mediaType === 'movie' || item.type === 'filme';
    }

    if (filtro === 'Séries') {
      return item.mediaType === 'tv';
    }

    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Lista</Text>

      <Text style={styles.subtitle}>
        Seus próximos filmes e séries.
      </Text>

      <View style={styles.filters}>
        {FILTERS.map((opcao) => (
          <Pressable
            key={opcao}
            style={[
              styles.filterButton,
              filtro === opcao && styles.filterButtonActive,
            ]}
            onPress={() => setFiltro(opcao)}
          >
            <Text
              style={[
                styles.filterText,
                filtro === opcao && styles.filterTextActive,
              ]}
            >
              {opcao}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.counter}>
        {listaFiltrada.length}{' '}
        {listaFiltrada.length === 1 ? 'conteúdo salvo' : 'conteúdos salvos'}
      </Text>

      {carregando ? (
        <Text style={styles.emptyText}>Carregando sua lista...</Text>
      ) : (
        <FlatList
          data={listaFiltrada}
          keyExtractor={(item) =>
            `${item.mediaType || 'manual'}-${item.id}`
          }
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Pressable
                disabled={!item.mediaType}
                onPress={() => abrirDetalhes(item)}
              >
                <MovieCard
                  title={item.title}
                  type={item.type}
                  year={item.year}
                  genre={item.genre}
                  poster={item.poster}
                  rating={item.rating}
                />
              </Pressable>

              <View style={styles.actions}>
                {item.mediaType && (
                  <Pressable
                    style={styles.detailsButton}
                    onPress={() => abrirDetalhes(item)}
                  >
                    <Text style={styles.actionText}>
                      Ver detalhes
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.removeButton}
                  onPress={() => remover(item)}
                >
                  <Text style={styles.actionText}>
                    Remover
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Sua lista está vazia
              </Text>

              <Text style={styles.emptyText}>
                Explore filmes e séries em Descobrir e adicione
                os conteúdos que deseja assistir.
              </Text>

              <Pressable
                style={styles.discoverButton}
                onPress={() => navigation.navigate('Descobrir')}
              >
                <Text style={styles.discoverButtonText}>
                  Explorar conteúdos
                </Text>
              </Pressable>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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

  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
  },

  filters: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
  },

  filterButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#38BDF8',
  },

  filterText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 12,
  },

  filterTextActive: {
    color: '#101820',
  },

  counter: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 18,
    marginBottom: 12,
  },

  itemContainer: {
    marginBottom: 20,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  removeButton: {
    flex: 1,
    backgroundColor: '#7F1D1D',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  actionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 65,
    paddingHorizontal: 15,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
  },

  discoverButton: {
    backgroundColor: '#38BDF8',
    padding: 14,
    borderRadius: 10,
    marginTop: 22,
  },

  discoverButtonText: {
    color: '#101820',
    fontWeight: 'bold',
  },
});
