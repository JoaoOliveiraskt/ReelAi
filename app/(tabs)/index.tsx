import { useState, useEffect } from 'react';
import { ScrollView } from '@/components/ui/scroll-view';
import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { MovieCard } from '@/components/MovieCard';
import { MovieBottomSheet } from '@/components/MovieBottomSheet';
import { getPopularMovies, searchMovies, Movie } from '@/services/api';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Search } from 'lucide-react-native';

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const bottom = useBottomTabBarHeight();

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setLoading(true);
    const data = await getPopularMovies();
    setMovies(data);
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setLoading(true);
      const results = await searchMovies(query);
      setMovies(results);
      setLoading(false);
    } else if (query.length === 0) {
      loadMovies();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant='heading'>ReelAI</Text>
        <Text variant='caption' style={styles.subtitle}>Descubra filmes incríveis</Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder='Buscar filmes...'
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon={Search}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: bottom + 20, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size='large' style={styles.loader} />
        ) : (
          <View>
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
});
