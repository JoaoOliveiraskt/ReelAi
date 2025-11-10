import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RAPID_API_KEY = process.env.EXPO_PUBLIC_RAPID_API_KEY || '';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

export interface Movie {
  id: string;
  title: string;
  year: number;
  releaseYear?: number;
  imageUrl: string;
  overview: string;
  genres: string[];
  rating?: number;
  runtime?: number;
  director?: string;
  actors?: string;
  awards?: string;
  streamingOptions: StreamingOption[];
}

export interface StreamingOption {
  name: string;
  link: string;
  type: string;
  logo?: string;
}

const streamingApi = axios.create({
  baseURL: 'https://streaming-availability.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': RAPID_API_KEY,
    'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
  }
});

async function getCachedData(key: string) {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  return null;
}

async function setCachedData(key: string, data: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

function parseStreamingOptions(streamingOptions: any): StreamingOption[] {
  if (!streamingOptions) return [];

  const brOptions = streamingOptions['br'] || [];
  const usOptions = streamingOptions['us'] || [];
  
  const allOptions = [...brOptions, ...usOptions];
  
  // Remove duplicatas baseado no serviço e tipo
  const uniqueOptions = new Map();
  
  const parsed = allOptions.map((option: any) => {
    const service = option.service || {};
    const imageSet = service.imageSet || {};
    
    return {
      name: service.name || 'Desconhecido',
      link: option.link || '',
      type: option.type === 'subscription' ? 'Streaming' : 
            option.type === 'rent' ? 'Aluguel' : 
            option.type === 'buy' ? 'Compra' : 
            option.type === 'free' ? 'Grátis' : 'Disponível',
      logo: imageSet.lightThemeImage || imageSet.whiteImage || imageSet.darkThemeImage
    };
  }).filter((option: StreamingOption) => {
    // Remove duplicatas e opções inválidas
    const key = `${option.name}-${option.type}`;
    if (uniqueOptions.has(key) || !option.name || option.name === 'Desconhecido') {
      return false;
    }
    uniqueOptions.set(key, true);
    return true;
  });

  return parsed;
}

function parseMovie(data: any): Movie {
  return {
    id: data.imdbId || data.id || Math.random().toString(),
    title: data.title || '',
    year: data.releaseYear || 0,
    releaseYear: data.releaseYear || 0,
    imageUrl: data.imageSet?.verticalPoster?.w480 || data.imageSet?.verticalPoster?.w360 || '',
    overview: data.overview || '',
    genres: data.genres?.map((g: any) => g.name) || [],
    rating: data.rating || 0,
    runtime: data.runtime || 0,
    director: data.directors?.[0] || '',
    actors: data.cast?.slice(0, 5).join(', ') || '',
    awards: '',
    streamingOptions: parseStreamingOptions(data.streamingOptions)
  };
}

async function getMovieDetails(id: string): Promise<Movie | null> {
  const cacheKey = `movie_${id}`;
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await streamingApi.get(`/shows/${id}`, {
      params: {
        output_language: 'en'
      }
    });

    const movie = parseMovie(response.data);
    await setCachedData(cacheKey, movie);
    return movie;
  } catch (error) {
    return null;
  }
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const cacheKey = `search_${query}`;
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await streamingApi.get('/shows/search/title', {
      params: {
        title: query,
        country: 'br',
        show_type: 'movie',
        output_language: 'en'
      }
    });

    const results = response.data.slice(0, 3);

    const detailedResults = await Promise.all(
      results.map(async (r: any) => await getMovieDetails(r.id))
    );

    const movies = detailedResults.filter(Boolean) as Movie[];
    await setCachedData(cacheKey, movies);
    return movies;
  } catch (error: any) {
    return [];
  }
}

export async function getPopularMovies(): Promise<Movie[]> {
  const cacheKey = 'popular_movies';
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const popularQueries = ['Avengers', 'Spider-Man', 'Batman'];
    const promises = popularQueries.map(async (title) => {
      try {
        const response = await streamingApi.get('/shows/search/title', {
          params: {
            title,
            country: 'br',
            show_type: 'movie',
            output_language: 'en'
          }
        });
        
        const results = response.data.slice(0, 2);
        const detailedResults = await Promise.all(
          results.map(async (r: any) => await getMovieDetails(r.id))
        );
        
        return detailedResults.filter(Boolean) as Movie[];
      } catch {
        return [];
      }
    });

    const results = await Promise.all(promises);
    const movies = results.flat().slice(0, 10);
    
    await setCachedData(cacheKey, movies);
    return movies;
  } catch (error) {
    return [];
  }
}
