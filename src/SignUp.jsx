import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import GlowCard from './GlowCard';
import './Auth.css';

const SignUp = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.elements.displayName.value;
    // Simulate signup success
    onNavigate('welcome', { name });
  };

  return (
    <div className="signin-container">
      <GlowCard>
        <div className="signin-header">
          <h1 className="signin-logo">STREAK 7</h1>
          <div className="signin-logo-underline"></div>
        </div>
        
        <p className="signin-subtitle">Start Your Level Up !</p>
        
        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input 
              type="text" 
              id="displayName" 
              placeholder="Enter your Name" 
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your Email" 
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="Enter your Password" 
                className="form-input password-input"
                required
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
            Sign Up
          </button>
        </form>
        
        <p className="signin-footer">
          Already have an Account? <span className="signup-link" onClick={() => onNavigate('signin')}>Sign In</span>
        </p>
      </GlowCard>
    </div>
  );
};

export default SignUp;
