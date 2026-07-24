import { useState, FC } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import GlowCard from './GlowCard';
import './Auth.css';
import { OnNavigateFn } from './types';

export interface SignInProps {
  onNavigate: OnNavigateFn;
}

const SignIn: FC<SignInProps> = ({ onNavigate }) => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      onNavigate('dashboard', { name: user.displayName || user.email?.split('@')[0] || 'User' });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Google Sign-In Error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain not authorized in Firebase Console (add localhost under Auth Authorized Domains).');
      } else if (error.code === 'auth/invalid-api-key') {
        setErrorMsg('Please configure your Firebase credentials in .env file.');
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(error.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <GlowCard>
        <div className="signin-header">
          <h1 className="signin-logo">STREAK 7</h1>
          <div className="signin-logo-underline"></div>
        </div>
        
        <p className="signin-subtitle">Welcome back! Sign in to continue your streak.</p>
        
        {errorMsg && <div className="auth-error">{errorMsg}</div>}

        <button 
          type="button" 
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{ marginTop: '1.5rem', marginBottom: '1rem' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          {loading ? 'Connecting...' : 'Sign in with Google'}
        </button>
      </GlowCard>
    </div>
  );
};

export default SignIn;
