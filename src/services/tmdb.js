
const BASE_URL = 'https://api.themoviedb.org/3';

async function fazerRequisicaoCompleta(endpoint) {
  const token = process.env.EXPO_PUBLIC_TMDB_TOKEN;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  return response.json();
}

// Mantém o formato antigo: retorna somente a lista de resultados.
async function fazerRequisicao(endpoint) {
  const data = await fazerRequisicaoCompleta(endpoint);
  return data.results;
}

// Filmes populares com paginação.
export async function getPopularMovies() {
  return fazerRequisicao('/movie/popular?language=pt-BR&page=1');
}

export async function getPopularMoviesPage(page = 1) {
  return fazerRequisicaoCompleta(
    `/movie/popular?language=pt-BR&page=${page}`
  );
}

// Séries populares com paginação.
export async function getPopularSeries() {
  return fazerRequisicao('/tv/popular?language=pt-BR&page=1');
}

export async function getPopularSeriesPage(page = 1) {
  return fazerRequisicaoCompleta(
    `/tv/popular?language=pt-BR&page=${page}`
  );
}

// Busca de filmes pelo título.
export async function searchMovies(query, page = 1) {
  return fazerRequisicaoCompleta(
    `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=pt-BR&page=${page}`
  );
}

// Busca de séries pelo título.
export async function searchSeries(query, page = 1) {
  return fazerRequisicaoCompleta(
    `/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=pt-BR&page=${page}`
  );
}

export async function getSeriesDetails(seriesId) {
  const response = await fazerRequisicaoCompleta(
    `/tv/${seriesId}?language=pt-BR`
  );

  return response;
}

export async function getSeasonDetails(seriesId, seasonNumber) {
  return fazerRequisicaoCompleta(
    `/tv/${seriesId}/season/${seasonNumber}?language=pt-BR`
  );
}

export async function getMovieDetails(movieId) {
  return fazerRequisicaoCompleta(
    `/movie/${movieId}?language=pt-BR`
  );
}

export async function getMovieCredits(movieId) {
  return fazerRequisicaoCompleta(
    `/movie/${movieId}/credits?language=pt-BR`
  );
}

export async function getSeriesCredits(seriesId) {
  return fazerRequisicaoCompleta(
    `/tv/${seriesId}/credits?language=pt-BR`
  );
}
