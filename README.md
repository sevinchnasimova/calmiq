# calmiq

A self-care mobile app that helps users build healthier daily habits, track sleep, practice mindfulness, and visualize their progress over time, all in one place.

I built calmiq to bring together a few self-care tools I kept using separately (a habit tracker, a meditation timer, a sleep log) into a single, cohesive app with one consistent experience, rather than juggling multiple apps for related goals.

## Features

- **Habit Tracking** — Create and track daily, weekly, or monthly habits, with progress visible at a glance
- **Meditation Timer** — Guided meditation sessions with customizable timers to fit different routines
- **Sleep Logging** — Track sleep patterns and quality over time
- **Streak Analytics** — Visualize progress and streaks through interactive charts, making long-term patterns easy to see rather than just logging data with no feedback loop
- **Modern, Polished UI** — Gradient-based design with smooth animations, built for a calm, unobtrusive feel appropriate for a self-care app

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native with Expo |
| Navigation | Expo Router (file-based routing) |
| UI Components | React Native Paper + custom components |
| Backend | Appwrite (Database & Authentication) |
| Charts / Analytics | React Native Chart Kit |
| Styling | Linear gradients, custom animations |
| Language | TypeScript |

## How It Works

calmiq uses [Appwrite](https://appwrite.io/) as its backend, handling user authentication and real-time data storage for habits, sleep logs, and meditation sessions. The app communicates with Appwrite through its REST APIs, parsing JSON responses and syncing data across screens so a user's progress stays consistent and up to date across the app.

The front end is built entirely in React Native and TypeScript, with file-based routing through Expo Router to keep navigation organized as the app grew past a handful of screens. State is managed with React Hooks rather than an external state management library, since the app's data flows were simple enough not to need one, and I wanted to fully understand how state propagation worked rather than relying on a library to abstract it away.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/sevinchnasimova/calmiq.git
cd calmiq

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Appwrite project credentials in .env

# Start the development server
npx expo start
```

## Project Structure

```
calmiq/
├── app/          # Screens and file-based routes (Expo Router)
├── assets/       # Images, fonts, and other static assets
├── lib/          # Appwrite client setup and helper functions
├── types/        # TypeScript type definitions
└── .env.example  # Template for required environment variables
```

