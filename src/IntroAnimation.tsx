import { useEffect, useState, FC } from 'react';
import './IntroAnimation.css';

const IntroAnimation: FC = () => {
  const [animationStarted, setAnimationStarted] = useState<boolean>(false);

  useEffect(() => {
    // Start animation slightly after mount for a smooth entry
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="intro-container">
      <div className={`logo-wrapper ${animationStarted ? 'start-anim' : ''}`}>
        <h1 className="logo-text">STREAK 7</h1>
        <div className="red-line"></div>
      </div>
    </div>
  );
};

export default IntroAnimation;
