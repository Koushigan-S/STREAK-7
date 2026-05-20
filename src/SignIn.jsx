import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import GlowCard from './GlowCard';
import './Auth.css';

const SignIn = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="signin-container">
      <GlowCard>
        <div className="signin-header">
          <h1 className="signin-logo">STREAK 7</h1>
          <div className="signin-logo-underline"></div>
        </div>
        
        <p className="signin-subtitle">Welcome back! Sign in to continue your streak.</p>
        
        <form className="signin-form" onSubmit={(e) => { 
          e.preventDefault(); 
          const email = e.target.elements.email.value;
          const name = email ? email.split('@')[0] : 'User';
          onNavigate('dashboard', { name });
        }}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="name@gmail.com" 
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="••••••••" 
                className="form-input password-input"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="submit-button">
            Sign In
          </button>
        </form>
        
        <p className="signin-footer">
          Don't have an Account? <span className="signup-link" onClick={() => onNavigate('signup')}>Sign up</span>
        </p>
      </GlowCard>
    </div>
  );
};

export default SignIn;
