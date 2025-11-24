import { useState, useEffect } from "react";
import { ScrollView } from "@/components/ui/scroll-view";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { MovieCard } from "@/components/MovieCard";
import { MovieBottomSheet } from "@/components/MovieBottomSheet";
import { getPopularMovies, searchMovies, getTopMoviesByService, Movie } from "@/services/api";
import { StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Search } from "lucide-react-native";
import { Skeleton } from "@/components/ui/skeleton";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import { StreamingBanner } from "@/components/StreamingBanner";

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [netflixMovies, setNetflixMovies] = useState<Movie[]>([]);
  const [amazonMovies, setAmazonMovies] = useState<Movie[]>([]);
  const [appleMovies, setAppleMovies] = useState<Movie[]>([]);
  const bottom = useBottomTabBarHeight();

  useEffect(() => {
    loadMovies();
    loadStreamingBanners();
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadMovies(true),
        loadStreamingBanners(true)
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMovies = async (forceRefresh = false) => {
    setLoading(!forceRefresh);
    const data = await getPopularMovies(forceRefresh);
    setMovies(data);
    setLoading(false);
  };

  const loadStreamingBanners = async (forceRefresh = false) => {
    try {
      // Carrega os top 5 filmes de cada serviço
      const [netflix, amazon, apple] = await Promise.all([
        getTopMoviesByService('netflix', forceRefresh),
        getTopMoviesByService('amazon', forceRefresh),
        getTopMoviesByService('apple', forceRefresh)
      ]);

      setNetflixMovies(netflix);
      setAmazonMovies(amazon);
      setAppleMovies(apple);
    } catch (error) {
      console.error('Error loading streaming banners:', error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setLoading(true);
        const results = await searchMovies(searchQuery);
        setMovies(results);
        setLoading(false);
      } else if (searchQuery.length === 0) {
        loadMovies();
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading">ReelAI</Text>
        <Text variant="caption" style={styles.subtitle}>
          Descubra filmes incríveis
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Buscar filmes..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: bottom + 20,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <MovieCardSkeleton />
        ) : (
          <View>
            {/* Streaming Service Banners */}
            {/*  {netflixMovies.length > 0 && (
              <StreamingBanner
                service="netflix"
                movies={netflixMovies}
                onMoviePress={setSelectedMovie}
                index={0}
              />
            )}
            {amazonMovies.length > 0 && (
              <StreamingBanner
                service="amazon"
                movies={amazonMovies}
                onMoviePress={setSelectedMovie}
                index={1}
              />
            )}
            {appleMovies.length > 0 && ( 
              <StreamingBanner
                service="apple"
                movies={appleMovies} 
                onMoviePress={setSelectedMovie}
                index={2}
              />
            )}
 */}
            {/* Popular Movies */}
            <Text style={styles.sectionTitle}>Filmes Populares</Text>
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPress={() => setSelectedMovie(movie)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <MovieBottomSheet
        movie={selectedMovie}
        isVisible={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  subtitle: {
    opacity: 0.6,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 16,
  },
});
