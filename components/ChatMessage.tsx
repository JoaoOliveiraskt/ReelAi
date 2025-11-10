import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/useColor';
import { Movie } from '@/services/api';
import { StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Star, Calendar, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 50) / 2.1;

interface ChatMessageProps {
  text: string;
  isUser: boolean;
  movies?: Movie[];
  onMoviePress?: (movie: Movie) => void;
}

export function ChatMessage({ text, isUser, movies, onMoviePress }: ChatMessageProps) {
  const aiBg = useColor('card');
  const borderColor = useColor('border');

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View style={[
        styles.bubble,
        { backgroundColor: isUser ? '#007AFF' : aiBg, borderColor },
        isUser && styles.userBubble
      ]}>
        <Text variant='body' style={[styles.text, isUser && styles.userText]}>{text}</Text>
      </View>
      
      {movies && movies.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.moviesScroll}
          contentContainerStyle={styles.moviesContent}
        >
          {movies.map((movie, index) => (
            <TouchableOpacity key={`${movie.id}-${index}`} onPress={() => onMoviePress?.(movie)} activeOpacity={0.8}>
              <View style={[styles.movieCard, { borderColor, width: CARD_WIDTH }]}>
                {movie.imageUrl ? (
                  <Image source={{ uri: movie.imageUrl }} style={styles.moviePoster} />
                ) : null}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.98)']}
                  locations={[0, 0.3, 0.7, 1]}
                  style={styles.movieInfo}
                >
                  <Text variant="caption" style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                  
                  <View style={styles.metaRow}>
                    {(movie.releaseYear || movie.year) ? (
                      <View style={styles.metaChip}>
                        <Calendar size={9} color="#fff" />
                        <Text variant="caption" style={styles.metaText}>{movie.releaseYear || movie.year}</Text>
                      </View>
                    ) : null}
                    {movie.runtime > 0 ? (
                      <View style={styles.metaChip}>
                        <Clock size={9} color="#fff" />
                        <Text variant="caption" style={styles.metaText}>{movie.runtime}m</Text>
                      </View>
                    ) : null}
                  </View>
                  
                  {movie.rating > 0 ? (
                    <View style={styles.rating}>
                      <Star size={10} color="#FFD700" fill="#FFD700" />
                      <Text variant="caption" style={styles.ratingText}>{movie.rating.toFixed(1)}</Text>
                    </View>
                  ) : null}
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  text: {
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  moviesScroll: {
    marginTop: 12,
  },
  moviesContent: {
    paddingRight: 20,
  },
  movieCard: {
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  moviePoster: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  movieInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 16,
  },
  movieTitle: {
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 16,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontWeight: '700',
    fontSize: 10,
    color: '#fff',
  },
});
