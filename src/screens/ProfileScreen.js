
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useIsFocused } from '@react-navigation/native';

import {
  getSeriesDetails,
  getSeasonDetails,
} from '../services/tmdb';

import {
  loadSeriesProgress,
} from '../storage/seriesProgressStorage';

import {
  loadProfile,
} from '../storage/profileStorage';

import {
  loadWatched,
  removeWatched,
} from '../storage/watchedStorage';

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [assistidos, setAssistidos] = useState([]);
  const [seriesAcompanhadas, setSeriesAcompanhadas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [serieExpandida, setSerieExpandida] = useState(null);
  const [episodiosDetalhados, setEpisodiosDetalhados] = useState({});
  const [carregandoTemporadas, setCarregandoTemporadas] = useState({});

  const isFocused = useIsFocused();

  useEffect(() => {
    async function carregarPerfil() {
      setLoading(true);

      const [profile, historico, progresso] = await Promise.all([
        loadProfile(),
        loadWatched(),
        loadSeriesProgress(),
      ]);

      setName(profile.name || '');
      setPhoto(profile.photo || null);
      setAssistidos(historico);

      const idsSeries = Object.keys(progresso);

      const series = await Promise.all(
        idsSeries.map(async (id) => {
          try {
            const detalhes = await getSeriesDetails(Number(id));
            const temporadas = progresso[id] || {};

            const temporadasAssistidas = Object.entries(temporadas)
              .map(([numero, episodios]) => ({
                numero,
                episodios: [...episodios].sort((a, b) => a - b),
                quantidade: episodios.length,
              }))
              .filter((temporada) => temporada.quantidade > 0)
              .sort((a, b) => Number(a.numero) - Number(b.numero));

            const episodiosAssistidos = temporadasAssistidas.reduce(
              (total, temporada) => total + temporada.quantidade,
              0
            );

            return {
              id,
              name: detalhes.name,
              poster: detalhes.poster_path
                ? `https://image.tmdb.org/t/p/w500${detalhes.poster_path}`
                : null,
              episodiosAssistidos,
              totalEpisodios: detalhes.number_of_episodes || 0,
              temporadasAssistidas,
            };
          } catch (error) {
            console.log(`Erro ao carregar série ${id}:`, error);
            return null;
          }
        })
      );

      setSeriesAcompanhadas(series.filter(Boolean));
      setLoading(false);
    }

    if (isFocused) {
      carregarPerfil();
    }
  }, [isFocused]);

  async function alternarSerie(serie) {
    if (serieExpandida === serie.id) {
      setSerieExpandida(null);
      return;
    }

    setSerieExpandida(serie.id);

    for (const temporada of serie.temporadasAssistidas) {
      const chave = `${serie.id}-${temporada.numero}`;

      if (episodiosDetalhados[chave]) {
        continue;
      }

      setCarregandoTemporadas((atual) => ({
        ...atual,
        [chave]: true,
      }));

      try {
        const detalhes = await getSeasonDetails(
          Number(serie.id),
          Number(temporada.numero)
        );

        const episodios = detalhes.episodes || [];

        const selecionados = temporada.episodios.map((numero) => {
          const episodio = episodios.find(
            (item) => item.episode_number === numero
          );

          return {
            numero,
            nome: episodio?.name || `Episódio ${numero}`,
          };
        });

        setEpisodiosDetalhados((atual) => ({
          ...atual,
          [chave]: selecionados,
        }));
      } catch (error) {
        console.log('Erro ao carregar episódios:', error);

        setEpisodiosDetalhados((atual) => ({
          ...atual,
          [chave]: temporada.episodios.map((numero) => ({
            numero,
            nome: `Episódio ${numero}`,
          })),
        }));
      } finally {
        setCarregandoTemporadas((atual) => ({
          ...atual,
          [chave]: false,
        }));
      }
    }
  }

  function confirmarRemocao(movie) {
    Alert.alert(
      'Remover filme',
      `Deseja remover "${movie.title}" do histórico?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const atualizados = await removeWatched(movie.id);
            setAssistidos(atualizados);
          },
        },
      ]
    );
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
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topHeader}>
        <Text style={styles.title}>Meu Perfil</Text>

        <Pressable
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>⚙</Text>
        </Pressable>
      </View>

      <View style={styles.profileHeader}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.profilePhoto} />
        ) : (
          <View style={styles.profilePhotoPlaceholder}>
            <Text style={styles.profilePhotoInitial}>
              {name ? name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {name || 'Usuário ShowMate'}
          </Text>
          <Text style={styles.profileSubtitle}>
            Sua jornada no mundo do entretenimento
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{assistidos.length}</Text>
          <Text style={styles.statLabel}>Filmes assistidos</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {seriesAcompanhadas.length}
          </Text>
          <Text style={styles.statLabel}>Séries acompanhadas</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minhas séries</Text>

        {seriesAcompanhadas.length === 0 ? (
          <Text style={styles.emptyMessage}>
            Você ainda não começou a acompanhar nenhuma série.
            Explore a aba Descobrir para começar!
          </Text>
        ) : (
          seriesAcompanhadas.map((serie) => {
            const percentual = serie.totalEpisodios > 0
              ? Math.round(
                  (serie.episodiosAssistidos / serie.totalEpisodios) * 100
                )
              : 0;

            const expandida = serieExpandida === serie.id;

            return (
              <View key={serie.id} style={styles.seriesCard}>
                <View style={styles.seriesHeader}>
                  {serie.poster ? (
                    <Image
                      source={{ uri: serie.poster }}
                      style={styles.seriesPoster}
                    />
                  ) : (
                    <View style={styles.posterPlaceholder}>
                      <Text style={styles.posterPlaceholderText}>TV</Text>
                    </View>
                  )}

                  <View style={styles.seriesInfo}>
                    <Text style={styles.seriesName}>
                      {serie.name}
                    </Text>

                    <Text style={styles.seriesProgress}>
                      {serie.episodiosAssistidos} de {serie.totalEpisodios} episódios
                    </Text>

                    <Text style={styles.seriesPercentage}>
                      {percentual}% concluído
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(percentual, 100)}%` },
                    ]}
                  />
                </View>

                <Pressable
                  style={styles.expandButton}
                  onPress={() => alternarSerie(serie)}
                >
                  <Text style={styles.expandButtonText}>
                    {expandida
                      ? 'Ocultar episódios'
                      : 'Ver episódios assistidos'}
                  </Text>

                  <Text style={styles.expandIcon}>
                    {expandida ? '⌃' : '⌄'}
                  </Text>
                </Pressable>

                {expandida && (
                  <View style={styles.episodesContainer}>
                    {serie.temporadasAssistidas.map((temporada) => {
                      const chave = `${serie.id}-${temporada.numero}`;
                      const episodios = episodiosDetalhados[chave] || [];
                      const carregando = carregandoTemporadas[chave];

                      return (
                        <View
                          key={temporada.numero}
                          style={styles.seasonContainer}
                        >
                          <Text style={styles.seasonTitle}>
                            Temporada {temporada.numero}
                          </Text>

                          {carregando ? (
                            <ActivityIndicator
                              color="#38BDF8"
                              size="small"
                              style={styles.episodeLoading}
                            />
                          ) : (
                            episodios.map((episodio) => (
                              <View
                                key={episodio.numero}
                                style={styles.episodeRow}
                              >
                                <Text style={styles.episodeNumber}>
                                  E{String(episodio.numero).padStart(2, '0')}
                                </Text>

                                <Text style={styles.episodeName}>
                                  {episodio.nome}
                                </Text>

                                <Text style={styles.episodeCheck}>✓</Text>
                              </View>
                            ))
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filmes assistidos</Text>

        {assistidos.length === 0 ? (
          <Text style={styles.emptyMessage}>
            Você ainda não marcou nenhum filme como assistido.
            Explore a aba Descobrir para começar!
          </Text>
        ) : (
          assistidos.map((movie) => (
            <View key={movie.id} style={styles.movieCard}>
              {movie.poster ? (
                <Image
                  source={{ uri: movie.poster }}
                  style={styles.moviePoster}
                />
              ) : (
                <View style={styles.moviePosterPlaceholder} />
              )}

              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle} numberOfLines={2}>
                  {movie.title}
                </Text>

                <Text style={styles.movieSubtitle}>
                  {movie.year} • {movie.type}
                </Text>

                {movie.rating ? (
                  <Text style={styles.movieRating}>
                    ★ {movie.rating}
                  </Text>
                ) : null}

                <Pressable
                  style={styles.removeButton}
                  onPress={() => confirmarRemocao(movie)}
                >
                  <Text style={styles.removeButtonText}>
                    Remover do histórico
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.tmdbContainer}>
        <Image
          source={require('../../assets/tmdb-logo.png')}
          style={styles.tmdbLogo}
          resizeMode="contain"
        />

        <Text style={styles.tmdbText}>
          Este produto utiliza a API do TMDB, mas não é endossado ou certificado pelo TMDB.
        </Text>

        <Text style={styles.tmdbNotice}>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </Text>
      </View>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#101820',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  editButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#38BDF8',
    fontSize: 23,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 25,
  },
  profilePhoto: {
    width: 65,
    height: 65,
    borderRadius: 33,
  },
  profilePhotoPlaceholder: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhotoInitial: {
    color: '#38BDF8',
    fontSize: 27,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },
  profileSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 17,
  },
  statNumber: {
    color: '#38BDF8',
    fontSize: 27,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 5,
  },
  section: {
    marginTop: 5,
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyMessage: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
  },
  seriesCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 13,
    marginBottom: 12,
  },
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seriesPoster: {
    width: 65,
    height: 95,
    borderRadius: 8,
  },
  posterPlaceholder: {
    width: 65,
    height: 95,
    borderRadius: 8,
    backgroundColor: '#101820',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    color: '#38BDF8',
    fontWeight: 'bold',
  },
  seriesInfo: {
    flex: 1,
    marginLeft: 13,
  },
  seriesName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seriesProgress: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 7,
  },
  seriesPercentage: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  progressBackground: {
    height: 7,
    backgroundColor: '#101820',
    borderRadius: 5,
    marginTop: 13,
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    backgroundColor: '#38BDF8',
    borderRadius: 5,
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 2,
  },
  expandButtonText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  expandIcon: {
    color: '#38BDF8',
    fontSize: 22,
    fontWeight: 'bold',
  },
  episodesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  seasonContainer: {
    marginBottom: 13,
  },
  seasonTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  episodeLoading: {
    marginVertical: 10,
  },
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#263548',
  },
  episodeNumber: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    width: 38,
  },
  episodeName: {
    color: '#CBD5E1',
    fontSize: 12,
    flex: 1,
  },
  episodeCheck: {
    color: '#38BDF8',
    fontSize: 14,
    marginLeft: 8,
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  moviePoster: {
    width: 68,
    height: 100,
    borderRadius: 8,
  },
  moviePosterPlaceholder: {
    width: 68,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#101820',
  },
  movieInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  movieTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  movieSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 5,
  },
  movieRating: {
    color: '#FBBF24',
    fontSize: 12,
    marginTop: 5,
  },
  removeButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#101820',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 7,
    marginTop: 9,
  },
  removeButtonText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  tmdbContainer: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    alignItems: 'center',
  },
  tmdbLogo: {
    width: 120,
    height: 50,
    marginBottom: 12,
  },
  tmdbText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  tmdbNotice: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
});
