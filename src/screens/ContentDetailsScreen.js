
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getMovieDetails,
  getMovieCredits,
  getSeriesDetails,
  getSeriesCredits,
  getSeasonDetails,
} from '../services/tmdb';

import {
  loadSeriesProgress,
  saveSeriesProgress,
} from '../storage/seriesProgressStorage';

const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const PROFILE_URL = 'https://image.tmdb.org/t/p/w185';

export default function ContentDetailsScreen({ route, navigation }) {
  const { item, type } = route.params;
  const isMovie = type === 'movie';

  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);

  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  const [progress, setProgress] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarDetalhes() {
      setLoading(true);
      setError('');

      try {
        const [dados, elenco] = await Promise.all([
          isMovie
            ? getMovieDetails(item.id)
            : getSeriesDetails(item.id),

          isMovie
            ? getMovieCredits(item.id)
            : getSeriesCredits(item.id),
        ]);

        if (!ativo) return;

        setDetails(dados);
        setCredits(elenco);

        if (!isMovie) {
          const temporadas = (dados.seasons || []).filter(
            (season) => season.season_number > 0
          );

          setSeasons(temporadas);

          if (temporadas.length > 0) {
            setSelectedSeason(temporadas[0].season_number);
          }

          const savedProgress = await loadSeriesProgress();

          if (ativo) {
            setProgress(savedProgress);
          }
        }
      } catch (error) {
        console.log('Erro ao carregar detalhes:', error);

        if (ativo) {
          setError('Não foi possível carregar as informações.');
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarDetalhes();

    return () => {
      ativo = false;
    };
  }, [item.id, isMovie]);

  useEffect(() => {
    if (isMovie || selectedSeason === null) return;

    let ativo = true;

    async function carregarEpisodios() {
      setLoadingEpisodes(true);
      setEpisodes([]);

      try {
        const data = await getSeasonDetails(
          item.id,
          selectedSeason
        );

        if (ativo) {
          setEpisodes(data.episodes || []);
        }
      } catch (error) {
        console.log('Erro ao carregar episódios:', error);

        if (ativo) {
          setEpisodes([]);
        }
      } finally {
        if (ativo) {
          setLoadingEpisodes(false);
        }
      }
    }

    carregarEpisodios();

    return () => {
      ativo = false;
    };
  }, [item.id, isMovie, selectedSeason]);

  const episodiosAssistidos =
    progress[item.id]?.[selectedSeason] || [];

  async function atualizarProgresso(novosEpisodios) {
    const updated = {
      ...progress,
      [item.id]: {
        ...progress[item.id],
        [selectedSeason]: novosEpisodios,
      },
    };

    setProgress(updated);
    await saveSeriesProgress(updated);
  }

  async function alternarEpisodio(numero) {
    const jaAssistido = episodiosAssistidos.includes(numero);

    const atualizados = jaAssistido
      ? episodiosAssistidos.filter((n) => n !== numero)
      : [...episodiosAssistidos, numero];

    await atualizarProgresso(atualizados);
  }

  async function alternarTemporada() {
    const todosOsEpisodios = episodes.map(
      (episode) => episode.episode_number
    );

    const completa =
      todosOsEpisodios.length > 0 &&
      todosOsEpisodios.every((numero) =>
        episodiosAssistidos.includes(numero)
      );

    await atualizarProgresso(
      completa ? [] : todosOsEpisodios
    );
  }

  const temporadaCompleta =
    episodes.length > 0 &&
    episodes.every((episode) =>
      episodiosAssistidos.includes(episode.episode_number)
    );

  const diretor = credits?.crew?.find(
    (person) => person.job === 'Director'
  );

  const elenco = credits?.cast?.slice(0, 12) || [];

  const criadores = details?.created_by || [];

  const titulo = details?.title || details?.name || item.title || item.name;

  const ano = (
    details?.release_date ||
    details?.first_air_date ||
    ''
  ).substring(0, 4);

  const generos = details?.genres || [];

  const imagem = details?.poster_path
    ? `${IMAGE_URL}${details.poster_path}`
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#38BDF8"
            style={styles.loader}
          />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <View style={styles.header}>
              {imagem ? (
                <Image
                  source={{ uri: imagem }}
                  style={styles.poster}
                />
              ) : null}

              <View style={styles.headerInfo}>
                <Text style={styles.title}>{titulo}</Text>

                <Text style={styles.info}>
                  {ano || 'Ano não informado'}
                </Text>

                <Text style={styles.rating}>
                  ★ {Number(details?.vote_average || 0).toFixed(1)} / 10
                </Text>

                <Text style={styles.info}>
                  {isMovie
                    ? `${details?.runtime || '--'} minutos`
                    : `${seasons.length} temporadas`}
                </Text>

                <Text style={styles.type}>
                  {isMovie ? 'FILME' : 'SÉRIE'}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Sinopse</Text>

            <Text style={styles.overview}>
              {details?.overview || 'Sinopse não disponível.'}
            </Text>

            <Text style={styles.sectionTitle}>Gêneros</Text>

            <View style={styles.genreContainer}>
              {generos.map((genre) => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>
              {isMovie ? 'Direção' : 'Criadores'}
            </Text>

            {isMovie ? (
              <Text style={styles.info}>
                {diretor?.name || 'Informação não disponível'}
              </Text>
            ) : criadores.length > 0 ? (
              criadores.map((creator) => (
                <Text key={creator.id} style={styles.info}>
                  {creator.name}
                </Text>
              ))
            ) : (
              <Text style={styles.info}>
                Informação não disponível
              </Text>
            )}

            <Text style={styles.sectionTitle}>Elenco</Text>

            {elenco.length === 0 ? (
              <Text style={styles.info}>
                Elenco não disponível.
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {elenco.map((actor) => (
                  <View key={actor.id} style={styles.actorCard}>
                    {actor.profile_path ? (
                      <Image
                        source={{
                          uri: `${PROFILE_URL}${actor.profile_path}`,
                        }}
                        style={styles.actorImage}
                      />
                    ) : (
                      <View style={styles.actorPlaceholder}>
                        <Text style={styles.actorPlaceholderText}>
                          ?
                        </Text>
                      </View>
                    )}

                    <Text style={styles.actorName}>
                      {actor.name}
                    </Text>

                    <Text style={styles.characterName}>
                      {actor.character || 'Personagem não informado'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {!isMovie && (
              <>
                <Text style={styles.sectionTitle}>Temporadas</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {seasons.map((season) => (
                    <Pressable
                      key={season.id}
                      style={[
                        styles.seasonButton,
                        selectedSeason === season.season_number &&
                          styles.seasonButtonActive,
                      ]}
                      onPress={() =>
                        setSelectedSeason(season.season_number)
                      }
                    >
                      <Text style={styles.seasonButtonText}>
                        Temporada {season.season_number}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>Episódios</Text>

                {loadingEpisodes ? (
                  <ActivityIndicator
                    size="large"
                    color="#38BDF8"
                    style={styles.loader}
                  />
                ) : episodes.length === 0 ? (
                  <Text style={styles.info}>
                    Nenhum episódio encontrado.
                  </Text>
                ) : (
                  <>
                    <Text style={styles.progressText}>
                      {episodiosAssistidos.length} de {episodes.length} episódios assistidos
                    </Text>

                    <Pressable
                      style={[
                        styles.completeButton,
                        temporadaCompleta && styles.completeButtonActive,
                      ]}
                      onPress={alternarTemporada}
                    >
                      <Text style={styles.completeButtonText}>
                        {temporadaCompleta
                          ? 'Desmarcar temporada inteira'
                          : 'Marcar temporada inteira como assistida'}
                      </Text>
                    </Pressable>

                    {episodes.map((episode) => {
                      const assistido = episodiosAssistidos.includes(
                        episode.episode_number
                      );

                      return (
                        <View
                          key={episode.id}
                          style={styles.episodeCard}
                        >
                          <View style={styles.episodeHeader}>
                            <View style={styles.episodeInfo}>
                              <Text style={styles.episodeNumber}>
                                Episódio {episode.episode_number}
                              </Text>

                              <Text style={styles.episodeTitle}>
                                {episode.name}
                              </Text>
                            </View>

                            <Pressable
                              style={[
                                styles.episodeButton,
                                assistido && styles.episodeButtonActive,
                              ]}
                              onPress={() =>
                                alternarEpisodio(episode.episode_number)
                              }
                            >
                              <Text style={styles.episodeButtonText}>
                                {assistido ? '✓' : '+'}
                              </Text>
                            </Pressable>
                          </View>

                          <Text style={styles.episodeDate}>
                            {episode.air_date || 'Data não informada'}
                          </Text>

                          {episode.overview ? (
                            <Text style={styles.episodeOverview}>
                              {episode.overview}
                            </Text>
                          ) : null}

                          <Text style={styles.statusText}>
                            {assistido ? 'Assistido' : 'Não assistido'}
                          </Text>
                        </View>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101820',
  },

  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 45,
  },

  backButton: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  loader: {
    marginTop: 40,
  },

  header: {
    flexDirection: 'row',
    gap: 18,
  },

  poster: {
    width: 125,
    height: 185,
    borderRadius: 12,
  },

  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },

  info: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
  },

  rating: {
    color: '#38BDF8',
    fontWeight: 'bold',
    marginTop: 12,
  },

  type: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 14,
  },

  overview: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 23,
  },

  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  genreTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  genreText: {
    color: '#38BDF8',
    fontSize: 12,
  },

  actorCard: {
    width: 115,
    marginRight: 12,
  },

  actorImage: {
    width: 115,
    height: 145,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },

  actorPlaceholder: {
    width: 115,
    height: 145,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actorPlaceholderText: {
    color: '#94A3B8',
    fontSize: 30,
  },

  actorName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 8,
  },

  characterName: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },

  seasonButton: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
  },

  seasonButtonActive: {
    backgroundColor: '#38BDF8',
  },

  seasonButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  progressText: {
    color: '#38BDF8',
    marginBottom: 12,
  },

  completeButton: {
    backgroundColor: '#38BDF8',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },

  completeButtonActive: {
    backgroundColor: '#0F766E',
  },

  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  episodeCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  episodeInfo: {
    flex: 1,
    paddingRight: 10,
  },

  episodeNumber: {
    color: '#38BDF8',
    fontSize: 13,
  },

  episodeTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 5,
  },

  episodeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  episodeButtonActive: {
    backgroundColor: '#0F766E',
  },

  episodeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  episodeDate: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },

  episodeOverview: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },

  statusText: {
    color: '#38BDF8',
    fontSize: 12,
    marginTop: 10,
    fontWeight: 'bold',
  },

  error: {
    color: '#F87171',
    marginTop: 20,
  },
});
