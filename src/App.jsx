import React, { useState, useEffect } from 'react';
import IntroAnimation from './IntroAnimation';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Welcome from './Welcome';
import Dashboard from './Dashboard';
import HabitsTasks from './HabitsTasks';
import Diary from './Diary';
import Stats from './Stats';
import Settings from './Settings';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('intro');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Transition to signin after animation completes (approx 3.5 seconds)
    if (currentView === 'intro') {
      const timer = setTimeout(() => {
        setCurrentView('signin');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const handleNavigate = (view, data = {}) => {
    if (data.name) {
      setUserName(data.name);
    }
    setCurrentView(view);
  };

  return (
    <div className="App">
      {currentView === 'intro' && <IntroAnimation />}
      {currentView === 'signin' && <SignIn onNavigate={handleNavigate} />}
      {currentView === 'signup' && <SignUp onNavigate={handleNavigate} />}
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
