import React from 'react';
import GlowCard from './GlowCard';
import './Auth.css';

const Welcome = ({ onNavigate, userName }) => {
  return (
    <div className="signin-container flex-col">
      <GlowCard className="welcome-card">
        <div className="welcome-content">
          <h2 className="welcome-title">Welcome!</h2>
          <p className="welcome-to">to</p>
          <h2 className="welcome-name">{userName || 'Name'}</h2>
          
          <div className="signin-header" style={{ marginTop: '2rem' }}>
            <h1 className="signin-logo">STREAK 7</h1>
            <div className="signin-logo-underline"></div>
          </div>
          
          <p className="signin-subtitle" style={{ marginBottom: 0 }}>Start Your Level Up !</p>
        </div>
      </GlowCard>
      
      <div className="welcome-footer">
        <button 
          className="submit-button back-button" 
          onClick={() => onNavigate('signin')}
        >
          Back to Sign IN
        </button>
      </div>
    </div>
  );
};

export default Welcome;
