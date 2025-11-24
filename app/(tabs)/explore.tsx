import { useState, useRef, useEffect } from 'react';
import { ScrollView } from '@/components/ui/scroll-view';
import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/ChatMessage';
import { MovieBottomSheet } from '@/components/MovieBottomSheet';
import { getMovieRecommendations } from '@/services/gemini';
import { searchMovies, Movie } from '@/services/api';
import { StyleSheet, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  movies?: Movie[];
  userPrompt?: string;
  loadMoreCount?: number;
  conversationContext?: string; // Store the current theme/genre
  isFollowUp?: boolean; // Is this a follow-up request (like "mais 3")
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Estou aqui para recomendar filmes. Me diga o que você gostaria de assistir!',
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Carrega mensagens do cache ao iniciar
  useEffect(() => {
    loadCachedMessages();
  }, []);

  // Salva mensagens no cache sempre que mudarem
  useEffect(() => {
    if (messages.length > 1) {
      // Não salva apenas a mensagem inicial
      saveCachedMessages();
    }
  }, [messages]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadCachedMessages = async () => {
    try {
      const cached = await AsyncStorage.getItem('chat_messages');
      if (cached) {
        const cachedMessages = JSON.parse(cached);
        setMessages(cachedMessages);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const saveCachedMessages = async () => {
    try {
      await AsyncStorage.setItem('chat_messages', JSON.stringify(messages));
    } catch (error) {
      // Silent error handling
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const currentInput = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Check if this is a follow-up request (like "mais 3", "mais 2")
      const isFollowUp = detectFollowUpRequest(currentInput);
      
      if (isFollowUp) {
        // Get the last AI message with context
        const lastAiMessage = messages.slice().reverse().find(m => !m.isUser && m.conversationContext);
        
        if (lastAiMessage && lastAiMessage.conversationContext) {
          console.log('🔍 Follow-up request, using context:', lastAiMessage.conversationContext);
          const moreMovies = await getMoreInContext(lastAiMessage.conversationContext, currentInput, lastAiMessage.movies || []);
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `Aqui estão mais filmes do tema "${lastAiMessage.conversationContext}":`,
            isUser: false,
            movies: moreMovies,
            conversationContext: lastAiMessage.conversationContext,
            isFollowUp: true,
          };

          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // No context found, fall back to normal recommendation
          console.log('🔍 No context found, using normal recommendation');
          const response = await getMovieRecommendations(currentInput);
          const context = extractContextFromMessage(currentInput);

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response.text,
            isUser: false,
            movies: response.movies,
            userPrompt: currentInput,
            conversationContext: context,
          };

          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        // New request - get recommendations normally
        const response = await getMovieRecommendations(currentInput);
        const context = extractContextFromMessage(currentInput);

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          isUser: false,
          movies: response.movies,
          userPrompt: currentInput,
          conversationContext: context,
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro. Tente novamente!',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Function to detect follow-up requests
  const detectFollowUpRequest = (input: string): boolean => {
    const lowerInput = input.toLowerCase();
    return lowerInput.includes('mais') && (
      lowerInput.includes('3') || 
      lowerInput.includes('2') || 
      lowerInput.includes('alguns') || 
      lowerInput.includes('mais') ||
      lowerInput.includes('outros')
    );
  };

  // Function to extract context from user message
  const extractContextFromMessage = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('terror') || lowerInput.includes('horror')) return 'terror';
    if (lowerInput.includes('comédia') || lowerInput.includes('comedy')) return 'comédia';
    if (lowerInput.includes('ação') || lowerInput.includes('action')) return 'ação';
    if (lowerInput.includes('drama')) return 'drama';
    if (lowerInput.includes('ficção') || lowerInput.includes('sci-fi')) return 'ficção científica';
    if (lowerInput.includes('romance')) return 'romance';
    if (lowerInput.includes('animação') || lowerInput.includes('animation')) return 'animação';
    if (lowerInput.includes('thriller')) return 'thriller';
    if (lowerInput.includes('documentário') || lowerInput.includes('documentary')) return 'documentário';
    if (lowerInput.includes('fantasia') || lowerInput.includes('fantasy')) return 'fantasia';
    if (lowerInput.includes('mistério') || lowerInput.includes('mystery')) return 'mistério';
    
    // For specific movie requests
    if (lowerInput.includes('avengers') || lowerInput.includes('marvel')) return 'super-heróis';
    if (lowerInput.includes('batman') || lowerInput.includes('superman')) return 'super-heróis';
    if (lowerInput.includes('star wars')) return 'ficção espacial';
    if (lowerInput.includes('harry potter')) return 'fantasia';
    if (lowerInput.includes('l LORD') || lowerInput.includes('senhor')) return 'fantasia';
    
    return 'geral';
  };

  // Function to get more movies in the same context
  const getMoreInContext = async (context: string, userInput: string, existingMovies: Movie[]): Promise<Movie[]> => {
    console.log('🔍 getMoreInContext: Context:', context, 'Input:', userInput);
    
    const existingTitles = existingMovies.map(m => m.title.toLowerCase());
    const additionalQueries = getAdditionalQueriesForContext(context, userInput, existingTitles);
    
    console.log('🔍 getMoreInContext: Additional queries:', additionalQueries);
    
    const moviePromises = additionalQueries.map(title => searchMovies(title));
    const movieResults = await Promise.all(moviePromises);
    
    const newMovies = movieResults
      .flatMap(result => result.slice(0, 1))
      .filter(movie => movie && movie.title)
      .filter(movie => !existingTitles.includes(movie.title.toLowerCase()));
    
    console.log('🔍 getMoreInContext: New movies found:', newMovies.length);
    return newMovies.slice(0, 3); // Return 3 more by default
  };

  // Function to get additional queries based on context
  const getAdditionalQueriesForContext = (context: string, userInput: string, existingTitles: string[]): string[] => {
    const contextQueries: { [key: string]: string[] } = {
      'terror': ['The Nun', 'Annabelle', 'It Chapter Two', 'Hereditary', 'The Exorcist', 'Insidious', 'A Quiet Place'],
      'comédia': ['The Hangover', 'Superbad', 'Bridesmaids', 'Borat', 'Step Brothers', 'Crazy Rich Asians'],
      'ação': ['Fast & Furious', 'Mission Impossible', 'Bourne', 'Die Hard', 'Taken', 'John Wick', 'Mad Max'],
      'drama': ['Moonlight', 'Dallas Buyers Club', '12 Years a Slave', 'Birdman', 'Spotlight'],
      'ficção científica': ['Blade Runner', 'Dune', 'Arrival', 'The Martian', 'Ex Machina', 'Interstellar'],
      'romance': ['La La Land', 'The Proposal', 'Crazy Rich Asians', 'Pride and Prejudice', 'The Notebook'],
      'animação': ['Inside Out', 'Coco', 'Ratatouille', 'Monsters Inc', 'Finding Nemo', 'Up'],
      'thriller': ['Gone Girl', 'Prisoners', 'The Girl with the Dragon Tattoo', 'Shutter Island'],
      'super-heróis': ['Spider-Man', 'Wonder Woman', 'Black Panther', 'Doctor Strange', 'Guardians of the Galaxy'],
      'fantasia': ['Pan\'s Labyrinth', 'The Shape of Water', 'The Grand Budapest Hotel'],
      'mistério': ['Knives Out', 'Murder on the Orient Express', 'The Prestige', 'Memento']
    };
    
    const queries = contextQueries[context] || ['Breaking Bad', 'Stranger Things', 'The Office', 'Game of Thrones'];
    
    // Filter out already shown titles
    return queries.filter(title => !existingTitles.includes(title.toLowerCase()));
  };

  // Remove the old handleLoadMore function since we're using conversation context now

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text variant="heading">Chat IA</Text>
        <Text variant="caption" style={styles.subtitle}>
          Converse e descubra filmes
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage
            message={item}
            onMoviePress={setSelectedMovie}
          />
        )}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={loading ? <ChatMessage message={{
          id: 'loading',
          text: 'Pensando...',
          isUser: false,
          conversationContext: undefined
        }} /> : null}
      />

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputWrapper}>
          <Input
            placeholder="Digite sua mensagem..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
        </View>
        <Button size="icon" icon={Send} onPress={handleSend} disabled={!input.trim() || loading} />
      </View>

      <MovieBottomSheet
        movie={selectedMovie}
        isVisible={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </KeyboardAvoidingView>
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
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputWrapper: {
    flex: 1,
  },
});
