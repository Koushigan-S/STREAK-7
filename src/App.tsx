import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import IntroAnimation from './IntroAnimation';
import SignIn from './SignIn';
import Welcome from './Welcome';
import Dashboard from './Dashboard';
import HabitsTasks from './HabitsTasks';
import Diary from './Diary';
import Stats from './Stats';
import Settings from './Settings';
import './App.css';
import { ViewType, NavigateData } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('intro');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Transition to signin after animation completes (approx 3.5 seconds)
    if (currentView === 'intro') {
      const timer = setTimeout(() => {
        if (auth.currentUser) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('signin');
        }
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const handleNavigate = (view: ViewType, data: NavigateData = {}) => {
    if (data.name) {
      setUserName(data.name);
    }
    setCurrentView(view);
  };

  return (
    <div className="App">
      {currentView === 'intro' && <IntroAnimation />}
      {currentView === 'signin' && <SignIn onNavigate={handleNavigate} />}
      {currentView === 'welcome' && <Welcome onNavigate={handleNavigate} userName={userName} />}
      {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} userName={userName} />}
      {currentView === 'habits' && <HabitsTasks onNavigate={handleNavigate} userName={userName} />}
      {currentView === 'diary' && <Diary onNavigate={handleNavigate} userName={userName} />}
      {currentView === 'stats' && <Stats onNavigate={handleNavigate} userName={userName} />}
      {currentView === 'settings' && <Settings onNavigate={handleNavigate} userName={userName} />}
    </div>
  );
}

export default App;
