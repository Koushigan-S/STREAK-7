# STREAK 7 🔥

A modern, high-performance habit tracker, daily task manager, interactive diary, and progress analytics web application built with React, TypeScript, and Firebase.

![Streak7 Banner](public/favicon.svg)

## 🚀 Features

- **Google Authentication**: Seamless one-click Google Sign-In powered by Firebase Auth.
- **Habit & Task Tracking**: Track daily habits, view streak counts, and analyze activity heatmaps.
- **Personal Diary**: Write, view, and expand past diary entries synced to Cloud Firestore in real time.
- **Stats & Achievements**: Visualize progress metrics across categories using interactive Recharts Radar Charts.
- **Custom Design System**: Dark-mode UI with dynamic glassmorphism glow cards and responsive navigation sidebar.
- **Firebase Firestore Integration**: Real-time cloud persistence for tasks, habits, diary entries, and user profiles.

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript (TSX)
- **Styling**: Vanilla CSS with custom properties & glassmorphism glow effects
- **Backend & Auth**: Firebase Auth (Google Sign-In) & Cloud Firestore
- **Charts & Icons**: Recharts, Lucide React
- **Build Tool**: Vite, TypeScript ESLint
- **Hosting**: Firebase Hosting ([streak7-16fb9.web.app](https://streak7-16fb9.web.app))

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Koushigan-S/STREAK-7.git
   cd STREAK-7
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Firebase credentials:
   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### Local Development

Start the Vite development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build & Deployment

1. Run type checks and build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```bash
   npx -y firebase-tools@latest deploy --only hosting
   ```

## 📜 License

This project is open-source and available under the MIT License.
