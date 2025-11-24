# Project Overview

This is a React Native project for a movie recommendation app called "ReelAI". It's built with Expo and TypeScript.

The app has two main screens: a home screen for browsing and searching movies, and a chat screen for getting AI-powered recommendations. It uses the Streaming Availability API to get movie data and the Google Gemini API for the chat functionality.

The UI is built with BNA UI and styled with NativeWind (Tailwind CSS). Caching is implemented using AsyncStorage to reduce API calls.

# Building and Running

To get started, you'll need to have Node.js and npm installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Then, edit the `.env` file to add your API keys for the Streaming Availability API and Google Gemini API.

3.  **Run the app:**
    *   To start the development server:
        ```bash
        npm start
        ```
    *   To run on Android:
        ```bash
        npm run android
        ```
    *   To run on iOS:
        ```bash
        npm run ios
        ```
    *   To run on the web:
        ```bash
        npm run web
        ```

# Development Conventions

*   **Linting:** The project uses ESLint for code linting. You can run the linter with:
    ```bash
    npm run lint
    ```
*   **Component Library:** The project uses BNA UI for its UI components.
*   **Styling:** Styling is done with NativeWind, which is a Tailwind CSS implementation for React Native.
*   **API Interaction:** All interactions with external APIs are handled in the `services` directory. `api.ts` is for the Streaming Availability API, and `gemini.ts` is for the Google Gemini API.
*   **State Management:** Component-level state is managed with React's `useState` and `useEffect` hooks.
*   **Navigation:** The app uses Expo Router for navigation.
