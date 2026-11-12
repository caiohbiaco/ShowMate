
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getSeriesDetails,
  getSeasonDetails,
} from '../services/tmdb';

import {
  loadSeriesProgress,
  saveSeriesProgress,
} from '../storage/seriesProgressStorage';

export default function SeriesDetailsModal({
  visible,
  series,
  onClose,
}) {
  const [details, setDetails] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  const [progress, setProgress] = useState({});

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible || !series) return;

    let ativo = true;

    async function carregarDetalhes() {
      setLoadingDetails(true);
      setError('');
      setDetails(null);
      setEpisodes([]);
      setSelectedSeason(null);

      try {
        const [data, savedProgress] = await Promise.all([
          getSeriesDetails(series.id),
          loadSeriesProgress(),
        ]);

        if (!ativo) return;

        const temporadas = (data.seasons || []).filter(
          (season) => season.season_number > 0
        );

        setDetails(data);
        setSeasons(temporadas);
        setProgress(savedProgress);

        if (temporadas.length > 0) {
          setSelectedSeason(temporadas[0].season_number);
        }
      } catch (error) {
        if (ativo) {
          setError('Não foi possível carregar os detalhes da série.');
        }
      } finally {
        if (ativo) {
          setLoadingDetails(false);
        }
      }
    }

    carregarDetalhes();

    return () => {
      ativo = false;
    };
  }, [visible, series?.id]);

  useEffect(() => {
    if (!visible || !series || selectedSeason === null) return;

    let ativo = true;

    async function carregarEpisodios() {
      setLoadingEpisodes(true);

      try {
        const data = await getSeasonDetails(
          series.id,
          selectedSeason
        );

        if (ativo) {
          setEpisodes(data.episodes || []);
        }
      } catch (error) {
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
  }, [visible, series?.id, selectedSeason]);

  const episodiosAssistidos =
    progress[series?.id]?.[selectedSeason] || [];

  async function atualizarProgresso(novosEpisodios) {
    const updated = {
      ...progress,
      [series.id]: {
        ...progress[series.id],
        [selectedSeason]: novosEpisodios,
      },
    };

    setProgress(updated);
    await saveSeriesProgress(updated);
  }

  async function alternarEpisodio(episodeNumber) {
    const jaAssistido = episodiosAssistidos.includes(episodeNumber);

    const updatedEpisodes = jaAssistido
      ? episodiosAssistidos.filter((number) => number !== episodeNumber)
      : [...episodiosAssistidos, episodeNumber];

    await atualizarProgresso(updatedEpisodes);
  }

  async function marcarTemporadaCompleta() {
    const todosOsEpisodios = episodes.map(
      (episode) => episode.episode_number
    );

    await atualizarProgresso(todosOsEpisodios);
  }

  const temporadaCompleta =
    episodes.length > 0 &&
    episodiosAssistidos.length === episodes.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={onClose}>
            <Text style={styles.closeButton}>← Voltar</Text>
          </Pressable>

          {loadingDetails ? (
            <ActivityIndicator
              size="large"
              color="#38BDF8"
              style={styles.loader}
            />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <>
              <Text style={styles.title}>
                {details?.name || series?.name}
              </Text>

              <Text style={styles.info}>
                {details?.first_air_date?.substring(0, 4) || 'Ano não informado'}
                {' • '}
                {seasons.length} temporadas
              </Text>

              <Text style={styles.overview}>
                {details?.overview || 'Descrição não disponível.'}
              </Text>

              <Text style={styles.sectionTitle}>
                Temporadas
              </Text>

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

              <Text style={styles.sectionTitle}>
                Episódios
              </Text>

              {loadingEpisodes ? (
                <ActivityIndicator
                  size="large"
                  color="#38BDF8"
                  style={styles.loader}
                />
              ) : episodes.length === 0 ? (
                <Text style={styles.emptyMessage}>
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
                    onPress={marcarTemporadaCompleta}
                    disabled={temporadaCompleta}
                  >
                    <Text style={styles.completeButtonText}>
                      {temporadaCompleta
                        ? '✓ Temporada concluída'
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
        </ScrollView>
      </View>
    </Modal>
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
    paddingBottom: 40,
  },

  closeButton: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  loader: {
    marginTop: 40,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },

  info: {
    color: '#38BDF8',
    marginTop: 8,
  },

  overview: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 18,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 14,
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
    backgroundColor: '#1E293B',
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

  emptyMessage: {
    color: '#94A3B8',
    marginTop: 10,
  },

  error: {
    color: '#F87171',
    marginTop: 20,
  },
});
