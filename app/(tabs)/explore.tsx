import { useState, useRef, useEffect } from 'react';
import { ScrollView } from '@/components/ui/scroll-view';
import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/ChatMessage';
import { MovieBottomSheet } from '@/components/MovieBottomSheet';
import { getMovieRecommendations } from '@/services/gemini';
import { Movie } from '@/services/api';
import { StyleSheet, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  movies?: Movie[];
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: 'Olá! Estou aqui para recomendar filmes. Me diga o que você gostaria de assistir!', 
      isUser: false 
    }
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
    if (messages.length > 1) { // Não salva apenas a mensagem inicial
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

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await getMovieRecommendations(currentInput);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        movies: response.movies
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro. Tente novamente!',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text variant='heading'>Chat IA</Text>
        <Text variant='caption' style={styles.subtitle}>Converse e descubra filmes</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage
            text={item.text}
            isUser={item.isUser}
            movies={item.movies}
            onMoviePress={setSelectedMovie}
          />
        )}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={loading ? <ChatMessage text='Pensando...' isUser={false} /> : null}
      />

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputWrapper}>
          <Input
            placeholder='Digite sua mensagem...'
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType='send'
          />
        </View>
        <Button
          size='icon'
          icon={Send}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        />
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
