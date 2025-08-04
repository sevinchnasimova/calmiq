# Self-Care App 🧘‍♀️

A beautiful React Native/Expo app for tracking habits, meditation, sleep, and personal wellness with AI assistance.

## Features

- 📊 **Habit Tracking** - Create and track daily, weekly, or monthly habits
- 🧘 **Meditation Timer** - Guided meditation sessions with customizable timers
- 😴 **Sleep Logging** - Track your sleep patterns and quality
- 📈 **Streak Analytics** - Visualize your progress and streaks
- 🤖 **AI Assistant** - Get personalized wellness advice
- 🎨 **Beautiful UI** - Modern, gradient-based design with smooth animations

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **UI**: React Native Paper + Custom components
- **Backend**: Appwrite (Database & Authentication)
- **Charts**: React Native Chart Kit
- **Styling**: Linear Gradients, Custom animations

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables Setup

This app uses Appwrite as the backend. You need to set up your environment variables:

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your Appwrite credentials in `.env`:**
   ```bash
   EXPO_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint.com/v1
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
   EXPO_PUBLIC_APPWRITE_PLATFORM=your_platform_here
   EXPO_PUBLIC_DB_ID=your_database_id_here
   EXPO_PUBLIC_HABITS_COLLECTION_ID=your_habits_collection_id_here
   EXPO_PUBLIC_COMPLETIONS_COLLECTION_ID=your_completions_collection_id_here
   EXPO_PUBLIC_SLEEP_COLLECTION_ID=your_sleep_collection_id_here
   EXPO_PUBLIC_MOOD_COLLECTION_ID=your_mood_collection_id_here
   ```

3. **Get your Appwrite credentials:**
   - Create an account at [Appwrite.io](https://appwrite.io)
   - Create a new project
   - Set up your database and collections
   - Copy the project ID, endpoint, and collection IDs

### 3. Start the App

```bash
npx expo start
```

Then choose your platform:
- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Web Browser**: Press `w`
- **Expo Go App**: Scan the QR code

## Project Structure

```
app/
├── (tabs)/           # Main tab screens
│   ├── index.tsx     # Home dashboard
│   ├── add-habit.tsx # Create new habits
│   ├── meditation.tsx # Meditation sessions
│   ├── streaks.tsx   # Progress analytics
│   └── ...
├── auth.tsx          # Authentication screen
├── meditation-player.tsx # Meditation timer
└── _layout.tsx       # Root layout
lib/
├── appwrite.ts       # Appwrite configuration
└── auth-context.tsx  # Authentication context
```

## Security Notes

- ✅ `.env` file is ignored by Git (your API keys are safe)
- ✅ `.env.example` shows required variables without real values
- ✅ All sensitive data is stored securely in Appwrite

## Contributing

1. Fork the repository
2. Create your feature branch
3. Set up your environment variables
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Expo Router](https://docs.expo.dev/router/introduction/)
