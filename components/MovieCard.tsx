import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { Movie } from '@/services/api';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, ArrowRight, Calendar, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MovieCardProps {
  movie: Movie;
  onPress: () => void;
}

export function MovieCard({ movie, onPress }: MovieCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.card}>
        <Image source={{ uri: movie.imageUrl }} style={styles.poster} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.98)']}
          locations={[0, 0.4, 0.75, 1]}
          style={styles.overlay}
        >
          <View style={styles.content}>
            <View style={styles.info}>
              <Text variant='h2' style={styles.title} numberOfLines={2}>{movie.title}</Text>
              
              <View style={styles.metaRow}>
                {(movie.releaseYear || movie.year) && (
                  <View style={styles.metaChip}>
                    <Calendar size={11} color='#fff' />
                    <Text variant='caption' style={styles.metaText}>{movie.releaseYear || movie.year}</Text>
                  </View>
                )}
                {movie.runtime > 0 && (
                  <View style={styles.metaChip}>
                    <Clock size={11} color='#fff' />
                    <Text variant='caption' style={styles.metaText}>{movie.runtime} min</Text>
                  </View>
                )}
              </View>
              
              {movie.rating > 0 && (
                <View style={styles.ratingChip}>
                  <Star size={14} color='#FFD700' fill='#FFD700' />
                  <Text variant='body' style={styles.ratingText}>{movie.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionButton}>
              <ArrowRight size={24} color='#000' strokeWidth={2.5} />
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    height: 450,
    marginBottom: 20,
    backgroundColor: '#000',
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 24,
  },
  info: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  metaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
