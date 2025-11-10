import { GoogleGenAI, Type } from '@google/genai';
import { searchMovies } from './api';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const movieQueriesSchema = {
  type: Type.OBJECT,
  properties: {
    needsMovies: {
      type: Type.BOOLEAN,
      description: 'True if the user is asking for movie recommendations, false otherwise'
    },
    response: {
      type: Type.STRING,
      description: 'A friendly response to the user in Portuguese'
    },
    queries: {
      type: Type.ARRAY,
      description: 'Specific movie titles or very precise search terms (only if needsMovies is true)',
      items: {
        type: Type.STRING
      }
    },
    requestedCount: {
      type: Type.NUMBER,
      description: 'Number of movies/series the user specifically requested (1, 3, 5, 10, etc). Default to 3 if not specified.'
    }
  },
  required: ['needsMovies', 'response']
};

export async function getMovieRecommendations(userMessage: string) {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Você é um especialista em cinema e TV que recomenda filmes E SÉRIES com ALTA PRECISÃO.

REGRAS IMPORTANTES:
1. RESPEITE SEMPRE a quantidade específica que o usuário pedir
2. Se o usuário pedir "1 filme", retorne EXATAMENTE 1 título
3. Se pedir "top 3", "3 filmes", retorne EXATAMENTE 3 títulos
4. Se pedir "top 5", "5 séries", retorne EXATAMENTE 5 títulos
5. Se pedir "top 10", retorne EXATAMENTE 10 títulos
6. Se não especificar quantidade, use 3 como padrão
7. Seja MUITO específico nos termos de busca - use títulos exatos conhecidos
8. Para séries, use títulos como "Breaking Bad", "Stranger Things", "The Office", etc.
9. Se for cumprimento/conversa casual, responda brevemente com needsMovies=false
10. NÃO responda sobre código, programação ou assuntos técnicos complexos
11. Sempre responda em português brasileiro
12. Misture filmes e séries nas recomendações para dar mais variedade

EXEMPLOS DE QUANTIDADE:
- "me recomenda 1 filme de terror" → requestedCount: 1, queries: ["The Conjuring"]
- "top 3 filmes de ação" → requestedCount: 3, queries: ["John Wick", "Mad Max", "The Matrix"]
- "quero 5 séries de comédia" → requestedCount: 5, queries: ["The Office", "Friends", "Brooklyn Nine-Nine", "Parks and Recreation", "How I Met Your Mother"]
- "filme de skate" (sem quantidade) → requestedCount: 3, queries: ["Lords of Dogtown", "Skate Kitchen", "Mid90s"]

EXEMPLOS DE TEMAS:
- "filme de skate" → queries: ["Lords of Dogtown", "Skate Kitchen", "Mid90s", "Rocket Power"]
- "oi" → needsMovies: false, response: "Olá! Como posso ajudar com filmes e séries hoje?"
- "filme de terror" → queries: ["The Conjuring", "Hereditary", "Stranger Things", "American Horror Story"]
- "comédia" → queries: ["The Office", "Friends", "Superbad", "Brooklyn Nine-Nine"]
- "ação" → queries: ["John Wick", "Mad Max", "Breaking Bad", "The Mandalorian"]

Mensagem do usuário: "${userMessage}"

Retorne JSON com needsMovies, response, queries (se needsMovies=true) e requestedCount (número exato que o usuário pediu).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: movieQueriesSchema
        },
      });

      const jsonText = response.text.trim();
      const parsed = JSON.parse(jsonText);
      
      if (parsed.needsMovies && Array.isArray(parsed.queries) && parsed.queries.length > 0) {
        const requestedCount = parsed.requestedCount || 3;
        const moviePromises = parsed.queries.slice(0, requestedCount * 2).map((title: string) => searchMovies(title));
        const movieResults = await Promise.all(moviePromises);
        const movies = movieResults.flatMap(result => result.slice(0, 1)).filter(m => m && m.imageUrl);
        
        return {
          text: parsed.response || 'Aqui estão suas recomendações:',
          movies: movies.slice(0, requestedCount)
        };
      }
      
      return {
        text: parsed.response || 'Como posso ajudar você com filmes hoje?',
        movies: []
      };
    } catch (error: any) {
      retries--;
      
      if (error?.message?.includes('overloaded') && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      console.error('Gemini error:', error);
      return {
        text: 'O servidor de IA está ocupado no momento. Tente novamente em alguns segundos! 😊',
        movies: []
      };
    }
  }
  
  return {
    text: 'O servidor de IA está ocupado no momento. Tente novamente em alguns segundos! 😊',
    movies: []
  };
}
