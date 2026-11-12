
import { useState, useCallback } from 'react';

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  getMovieDetails,
  getSeriesDetails,
} from '../services/tmdb';

import { loadWatched } from '../storage/watchedStorage';

import {
  loadSeriesProgress,
} from '../storage/seriesProgressStorage';

const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

function formatarTempo(minutos) {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  if (horas === 0) {
    return `${minutosRestantes}min`;
  }

  return `${horas}h ${minutosRestantes}min`;
}

export default function HomeScreen({ navigation }) {
  const [filmes, setFilmes] = useState([]);
  const [series, setSeries] = useState([]);

  const [estatisticas, setEstatisticas] = useState({
    filmes: 0,
    series: 0,
    episodios: 0,
    minutos: 0,
  });

  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarHome() {
        setCarregando(true);

        try {
          const [historico, progresso] = await Promise.all([
            loadWatched(),
            loadSeriesProgress(),
          ]);

          let totalMinutos = 0;

          // Busca a duração real dos filmes assistidos.
          const filmesDetalhados = await Promise.all(
            historico.map(async (filme) => {
              try {
                const detalhes = await getMovieDetails(filme.id);

                totalMinutos += detalhes.runtime || 0;

                return {
                  ...filme,
                  runtime: detalhes.runtime || 0,
                };
              } catch (error) {
                console.log('Erro ao buscar duração do filme:', error);
                return filme;
              }
            })
          );

          // Identifica as séries que possuem episódios assistidos.
          const idsSeries = Object.keys(progresso).filter((id) => {
            const temporadas = progresso[id] || {};

            return Object.values(temporadas).some(
              (episodios) => episodios.length > 0
            );
          });

          let totalEpisodios = 0;

          const seriesDetalhadas = await Promise.all(
            idsSeries.map(async (id) => {
              const temporadas = progresso[id] || {};

              const quantidadeEpisodios = Object.values(
                temporadas
              ).reduce(
                (total, episodios) => total + episodios.length,
                0
              );

              totalEpisodios += quantidadeEpisodios;

              try {
                const detalhes = await getSeriesDetails(id);

                const duracaoMedia =
                  detalhes.episode_run_time?.[0] || 0;

                totalMinutos +=
                  quantidadeEpisodios * duracaoMedia;

                return {
                  id,
                  title: detalhes.name,
                  poster: detalhes.poster_path
                    ? `${IMAGE_URL}${detalhes.poster_path}`
                    : null,
                  episodios: quantidadeEpisodios,
                };
              } catch (error) {
                console.log('Erro ao buscar série:', error);
                return null;
              }
            })
          );

          if (!ativo) return;

          setFilmes(filmesDetalhados);
          setSeries(seriesDetalhadas.filter(Boolean));

          setEstatisticas({
            filmes: historico.length,
            series: idsSeries.length,
            episodios: totalEpisodios,
            minutos: totalMinutos,
          });
        } catch (error) {
          console.log('Erro ao carregar Home:', error);
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      }

      carregarHome();

      return () => {
        ativo = false;
      };
    }, [])
  );

  function abrirFilme(filme) {
    navigation.navigate('ContentDetails', {
      item: filme,
      type: 'movie',
    });
  }

  function abrirSerie(serie) {
    navigation.navigate('ContentDetails', {
      item: {
        id: Number(serie.id),
        title: serie.title,
      },
      type: 'tv',
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.logo}>ShowMate</Text>

      <Text style={styles.subtitle}>
        SEU DIÁRIO PESSOAL DE ENTRETENIMENTO.
      </Text>

      <View style={styles.welcome}>
        <Text style={styles.title}>Olá, cinéfilo!</Text>

        <Text style={styles.description}>
          Seu entretenimento em um só lugar.
        </Text>
      </View>

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#38BDF8"
          style={styles.loader}
        />
      ) : (
        <>
          <View style={styles.timeCard}>
            <Text style={styles.cardLabel}>
              TEMPO TOTAL ASSISTIDO
            </Text>

            <Text style={styles.timeValue}>
              {formatarTempo(estatisticas.minutos)}
            </Text>

            <Text style={styles.cardDescription}>
              Somando filmes e episódios assistidos
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎬</Text>
              <Text style={styles.statNumber}>
                {estatisticas.filmes}
              </Text>
              <Text style={styles.statLabel}>
                Filmes assistidos
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📺</Text>
              <Text style={styles.statNumber}>
                {estatisticas.series}
              </Text>
              <Text style={styles.statLabel}>
                Séries acompanhadas
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>▶</Text>
              <Text style={styles.statNumber}>
                {estatisticas.episodios}
              </Text>
              <Text style={styles.statLabel}>
                Episódios assistidos
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Filmes assistidos recentemente
            </Text>

            {filmes.length === 0 ? (
              <Text style={styles.emptyText}>
                Seus filmes assistidos aparecerão aqui.
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {filmes.slice(0, 10).map((filme) => (
                  <Pressable
                    key={filme.id}
                    style={styles.mediaCard}
                    onPress={() => abrirFilme(filme)}
                  >
                    {filme.poster ? (
                      <Image
                        source={{ uri: filme.poster }}
                        style={styles.poster}
                      />
                    ) : (
                      <View style={styles.posterPlaceholder} />
                    )}

                    <Text
                      style={styles.mediaTitle}
                      numberOfLines={2}
                    >
                      {filme.title}
                    </Text>

                    <Text style={styles.mediaInfo}>
                      {filme.runtime
                        ? `${filme.runtime} min`
                        : 'Filme'}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Minhas séries
            </Text>

            {series.length === 0 ? (
              <Text style={styles.emptyText}>
                Marque episódios como assistidos para acompanhar
                seu progresso aqui.
              </Text>
            ) : (
              series.map((serie) => (
                <Pressable
                  key={serie.id}
                  style={styles.seriesCard}
                  onPress={() => abrirSerie(serie)}
                >
                  {serie.poster ? (
                    <Image
                      source={{ uri: serie.poster }}
                      style={styles.seriesPoster}
                    />
                  ) : null}

                  <View style={styles.seriesInfo}>
                    <Text style={styles.seriesTitle}>
                      {serie.title}
                    </Text>

                    <Text style={styles.mediaInfo}>
                      {serie.episodios} episódios assistidos
                    </Text>
                  </View>

                  <Text style={styles.arrow}>›</Text>
                </Pressable>
              ))
            )}
          </View>
        </>
      )}

      <Pressable
        style={styles.discoverButton}
        onPress={() => navigation.navigate('Descobrir')}
      >
        <Text style={styles.discoverButtonText}>
          Descobrir novos filmes e séries
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
    paddingTop: 65,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  logo: {
    color: '#38BDF8',
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#94A3B8',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 5,
  },

  welcome: {
    marginTop: 35,
    marginBottom: 25,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold',
  },

  description: {
    color: '#94A3B8',
    fontSize: 15,
    marginTop: 7,
  },

  loader: {
    marginTop: 60,
  },

  timeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 22,
    marginBottom: 15,
  },

  cardLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  timeValue: {
    color: '#38BDF8',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 10,
  },

  cardDescription: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 5,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: 9,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 13,
    padding: 12,
    minHeight: 115,
    justifyContent: 'center',
  },

  statIcon: {
    fontSize: 19,
  },

  statNumber: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 7,
  },

  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
  },

  section: {
    marginTop: 32,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
  },

  mediaCard: {
    width: 125,
    marginRight: 14,
  },

  poster: {
    width: 125,
    height: 180,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },

  posterPlaceholder: {
    width: 125,
    height: 180,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },

  mediaTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 9,
  },

  mediaInfo: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
  },

  seriesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  seriesPoster: {
    width: 55,
    height: 78,
    borderRadius: 7,
  },

  seriesInfo: {
    flex: 1,
    marginLeft: 13,
  },

  seriesTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  arrow: {
    color: '#38BDF8',
    fontSize: 28,
    paddingHorizontal: 8,
  },

  discoverButton: {
    backgroundColor: '#38BDF8',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },

  discoverButtonText: {
    color: '#101820',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
