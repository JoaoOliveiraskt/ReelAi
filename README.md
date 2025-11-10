# ReelAI 🎬🤖

App de recomendação de filmes com IA, construído com Expo React Native, BNA UI e Google Gemini.

## ✨ Funcionalidades

- 🎨 **UI Moderna** - Interface fluida com tema claro/escuro usando BNA UI
- 🔍 **Busca de Filmes** - Pesquise filmes por título com dados da Streaming Availability API
- 🤖 **Chat com IA** - Converse com o Google Gemini para receber recomendações personalizadas
- 📱 **Bottom Sheet** - Visualize detalhes completos dos filmes (sinopse, gêneros, plataformas)
- 💾 **Cache Local** - Sistema de cache com AsyncStorage para economizar requisições
- 🎭 **Streaming Info** - Veja onde cada filme está disponível (Netflix, Prime Video, etc)

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/reelai.git
cd reelai

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas chaves de API
```

## 🔑 Configuração de APIs

### 1. Streaming Availability API (RapidAPI)
1. Acesse [RapidAPI](https://rapidapi.com/)
2. Inscreva-se na [Streaming Availability API](https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability)
3. Copie sua chave de API
4. Adicione no `.env`: `EXPO_PUBLIC_RAPID_API_KEY=sua_chave_aqui`

### 2. Google Gemini API
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma chave de API
3. Adicione no `.env`: `EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_aqui`

## 📱 Executar o App

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Executar no iOS
npm run ios

# Executar no Android
npm run android

# Executar na Web
npm run web
```

## 🏗️ Estrutura do Projeto

```
reelai/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Tela Home (busca e descoberta)
│   │   ├── explore.tsx        # Tela Chat (IA)
│   │   └── _layout.tsx        # Layout das tabs
│   └── _layout.tsx            # Layout raiz
├── components/
│   ├── ui/                    # Componentes BNA UI
│   ├── MovieCard.tsx          # Card de filme
│   ├── MovieBottomSheet.tsx   # Bottom sheet com detalhes
│   └── ChatMessage.tsx        # Mensagem do chat
├── services/
│   ├── api.ts                 # Integração com Streaming API
│   └── gemini.ts              # Integração com Gemini
└── theme/                     # Configuração de temas
```

## 🎯 Funcionalidades Principais

### Tela Home
- Busca de filmes por título
- Exibição de filmes populares
- Cards verticais com poster, título, ano e plataformas
- Tap no card abre Bottom Sheet com detalhes completos

### Tela Chat
- Conversa natural com IA
- Recomendações baseadas em preferências
- Cards horizontais scrolláveis com filmes sugeridos
- Tap nos cards abre detalhes no Bottom Sheet

### Sistema de Cache
- Cache de 24 horas para buscas e filmes populares
- Reduz chamadas à API e melhora performance
- Armazenamento local com AsyncStorage

## 🛠️ Tecnologias

- **Expo** - Framework React Native
- **BNA UI** - Biblioteca de componentes
- **NativeWind** - Estilização (Tailwind CSS)
- **Google Gemini** - IA para recomendações
- **Streaming Availability API** - Dados de filmes
- **AsyncStorage** - Cache local
- **Axios** - Requisições HTTP

## 📄 Licença

MIT

---

Desenvolvido com ❤️ usando BNA UI
