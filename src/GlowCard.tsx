import { useRef, useEffect, FC, ReactNode } from 'react';
import './GlowCard.css';

export interface GlowCardProps {
  children?: ReactNode;
  className?: string;
}

const GlowCard: FC<GlowCardProps> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`glow-card ${className}`} ref={cardRef}>
      <div className="glow-card-content">
        {children}
      </div>
    </div>
  );
};

export default GlowCard;
