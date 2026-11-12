
import { useState, useEffect, useCallback } from 'react';

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import MovieCard from '../components/MovieCard';

import {
  getPopularMoviesPage,
  getPopularSeriesPage,
  searchMovies,
  searchSeries,
} from '../services/tmdb';

import {
  loadWatched,
  addWatched,
  removeWatched,
} from '../storage/watchedStorage';

import {
  loadLibrary,
  saveLibrary,
} from '../storage/storage';

const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

export default function DiscoverScreen({ navigation }) {
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('filmes');

  const [filmes, setFilmes] = useState([]);
  const [series, setSeries] = useState([]);

  const [assistidos, setAssistidos] = useState([]);
  const [minhaLista, setMinhaLista] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);

  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(true);

  const [erro, setErro] = useState('');
  const [erroMais, setErroMais] = useState('');

  // Atualiza os dados salvos ao voltar para a tela.
  useFocusEffect(
    useCallback(() => {
      async function atualizarDados() {
        const [historico, lista] = await Promise.all([
          loadWatched(),
          loadLibrary(),
        ]);

        setAssistidos(historico);
        setMinhaLista(lista);
      }

      atualizarDados();
    }, [])
  );

  // Busca inicial, pesquisa por título e troca entre filmes e séries.
  useEffect(() => {
    let ativo = true;

    const termo = busca.trim();

    setCarregando(true);
    setErro('');
    setErroMais('');
    setPagina(1);
    setTemMais(true);

    const timer = setTimeout(async () => {
      try {
        let resposta;

        if (tipo === 'filmes') {
          resposta = termo
            ? await searchMovies(termo, 1)
            : await getPopularMoviesPage(1);
        } else {
          resposta = termo
            ? await searchSeries(termo, 1)
            : await getPopularSeriesPage(1);
        }

        if (!ativo) return;

        if (tipo === 'filmes') {
          setFilmes(resposta.results || []);
        } else {
          setSeries(resposta.results || []);
        }

        setTemMais(
          resposta.page < resposta.total_pages
        );
      } catch (error) {
        if (!ativo) return;

        setErro('Não foi possível carregar os conteúdos.');
        console.log('Erro ao buscar conteúdos:', error.message);
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }, termo ? 500 : 0);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [busca, tipo]);

  // Carrega a próxima página quando o usuário chega ao final.
  async function carregarMais() {
    if (carregando || carregandoMais || !temMais) {
      return;
    }

    const proximaPagina = pagina + 1;
    const termo = busca.trim();

    setCarregandoMais(true);
    setErroMais('');

    try {
      let resposta;

      if (tipo === 'filmes') {
        resposta = termo
          ? await searchMovies(termo, proximaPagina)
          : await getPopularMoviesPage(proximaPagina);
      } else {
        resposta = termo
          ? await searchSeries(termo, proximaPagina)
          : await getPopularSeriesPage(proximaPagina);
      }

      const novosResultados = resposta.results || [];

      if (tipo === 'filmes') {
        setFilmes((atuais) => {
          const idsExistentes = new Set(
            atuais.map((item) => item.id)
          );

          return [
            ...atuais,
            ...novosResultados.filter(
              (item) => !idsExistentes.has(item.id)
            ),
          ];
        });
      } else {
        setSeries((atuais) => {
          const idsExistentes = new Set(
            atuais.map((item) => item.id)
          );

          return [
            ...atuais,
            ...novosResultados.filter(
              (item) => !idsExistentes.has(item.id)
            ),
          ];
        });
      }

      setPagina(proximaPagina);

      setTemMais(
        resposta.page < resposta.total_pages
      );
    } catch (error) {
      setErroMais('Não foi possível carregar mais resultados.');
      console.log('Erro ao carregar mais:', error.message);
    } finally {
      setCarregandoMais(false);
    }
  }

  async function alternarAssistido(item) {
    const jaAssistido = assistidos.some(
      (filme) => filme.id === item.id
    );

    if (jaAssistido) {
      const atualizados = await removeWatched(item.id);
      setAssistidos(atualizados);
      return;
    }

    const filme = {
      id: item.id,
      title: item.title,
      type: 'Filme',
      year: item.release_date
        ? item.release_date.substring(0, 4)
        : 'Ano não informado',
      genre: 'Adicionado pelo TMDB',
      poster: item.poster_path
        ? `${IMAGE_URL}${item.poster_path}`
        : null,
      rating: Number(item.vote_average || 0).toFixed(1),
    };

    const atualizados = await addWatched(filme);

    setAssistidos(atualizados);
  }

  async function alternarMinhaLista(item) {
    const isMovie = tipo === 'filmes';
    const mediaType = isMovie ? 'movie' : 'tv';

    const jaAdicionado = minhaLista.some(
      (conteudo) =>
        conteudo.id === item.id &&
        conteudo.mediaType === mediaType
    );

    let atualizada;

    if (jaAdicionado) {
      atualizada = minhaLista.filter(
        (conteudo) =>
          !(
            conteudo.id === item.id &&
            conteudo.mediaType === mediaType
          )
      );
    } else {
      const data = item.release_date || item.first_air_date;

      const novoItem = {
        id: item.id,
        mediaType,
        title: item.title || item.name,
        type: isMovie ? 'Filme' : 'Série',
        year: data
          ? data.substring(0, 4)
          : 'Ano não informado',
        genre: 'Adicionado pelo TMDB',
        poster: item.poster_path
          ? `${IMAGE_URL}${item.poster_path}`
          : null,
        rating: Number(item.vote_average || 0).toFixed(1),
      };

      atualizada = [novoItem, ...minhaLista];
    }

    setMinhaLista(atualizada);
    await saveLibrary(atualizada);
  }

  function abrirDetalhes(item) {
    navigation.navigate('ContentDetails', {
      item,
      type: tipo === 'filmes' ? 'movie' : 'tv',
    });
  }

  const conteudos = tipo === 'filmes' ? filmes : series;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Descobrir</Text>

      <Text style={styles.subtitle}>
        Explore filmes e séries populares
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar título..."
        placeholderTextColor="#94A3B8"
        value={busca}
        onChangeText={setBusca}
        returnKeyType="search"
      />

      <View style={styles.tabs}>
        <Pressable
          style={[
            styles.tab,
            tipo === 'filmes' && styles.tabActive,
          ]}
          onPress={() => setTipo('filmes')}
        >
          <Text style={styles.tabText}>Filmes</Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            tipo === 'series' && styles.tabActive,
          ]}
          onPress={() => setTipo('series')}
        >
          <Text style={styles.tabText}>Séries</Text>
        </Pressable>
      </View>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.message}>
            {busca.trim()
              ? 'Buscando conteúdos...'
              : 'Carregando conteúdos...'}
          </Text>
        </View>
      ) : erro !== '' ? (
        <Text style={styles.error}>{erro}</Text>
      ) : (
        <FlatList
          key={tipo}
          data={conteudos}
          numColumns={2}
          columnWrapperStyle={styles.row}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isMovie = tipo === 'filmes';

            const titulo = item.title || item.name;

            const data = item.release_date || item.first_air_date;

            const ano = data
              ? data.substring(0, 4)
              : 'Ano não informado';

            const jaAssistido = assistidos.some(
              (filme) => filme.id === item.id
            );

            const jaNaLista = minhaLista.some(
              (conteudo) =>
                conteudo.id === item.id &&
                conteudo.mediaType === (isMovie ? 'movie' : 'tv')
            );

            return (
              <View style={styles.itemContainer}>
                <Pressable onPress={() => abrirDetalhes(item)}>
                  <MovieCard
                    compact
                    title={titulo}
                    type={isMovie ? 'Filme' : 'Série'}
                    year={ano}
                    genre={busca.trim() ? 'Resultado da busca' : 'Popular no TMDB'}
                    poster={
                      item.poster_path
                        ? `${IMAGE_URL}${item.poster_path}`
                        : null
                    }
                    rating={Number(item.vote_average || 0).toFixed(1)}
                  />
                </Pressable>

                <Pressable
                  style={[
                    styles.listButton,
                    jaNaLista && styles.listButtonActive,
                  ]}
                  onPress={() => alternarMinhaLista(item)}
                >
                  <Text style={styles.buttonText}>
                    {jaNaLista
                      ? '✓ Na minha lista'
                      : '+ Minha lista'}
                  </Text>
                </Pressable>

                {isMovie && (
                  <Pressable
                    style={[
                      styles.watchedButton,
                      jaAssistido && styles.watchedButtonActive,
                    ]}
                    onPress={() => alternarAssistido(item)}
                  >
                    <Text style={styles.buttonText}>
                      {jaAssistido
                        ? '✓ Assistido'
                        : 'Marcar assistido'}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.message}>
              Nenhum resultado encontrado.
            </Text>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              {carregandoMais ? (
                <ActivityIndicator color="#38BDF8" />
              ) : erroMais !== '' ? (
                <Text style={styles.error}>{erroMais}</Text>
              ) : temMais && conteudos.length > 0 ? (
                <Text style={styles.footerText}>
                  Role para carregar mais
                </Text>
              ) : conteudos.length > 0 ? (
                <Text style={styles.footerText}>
                  Você chegou ao final dos resultados.
                </Text>
              ) : null}
            </View>
          }
          onEndReached={carregarMais}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
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
    paddingHorizontal: 16,
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

  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 20,
  },

  tabs: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },

  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: '#38BDF8',
  },

  tabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  loadingContainer: {
    alignItems: 'center',
    marginTop: 30,
  },

  message: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 30,
  },

  error: {
    color: '#F87171',
    textAlign: 'center',
    marginTop: 20,
  },

  listContent: {
    paddingBottom: 30,
  },

  row: {
    justifyContent: 'space-between',
  },

  itemContainer: {
    width: '48%',
    marginBottom: 16,
  },

  listButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
    minHeight: 38,
  },

  listButtonActive: {
    backgroundColor: '#0F766E',
  },

  watchedButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
    minHeight: 38,
  },

  watchedButtonActive: {
    backgroundColor: '#334155',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },

  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  footerText: {
    color: '#94A3B8',
    fontSize: 12,
  },
});
