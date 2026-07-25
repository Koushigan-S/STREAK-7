import { FC, ReactNode } from 'react';
import './GlowCard.css';

export interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const GlowCard: FC<GlowCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div className={`glow-card ${className}`} onClick={onClick}>
      <div className="glow-card-content">
        {children}
      </div>
    </div>
  );
};

export default GlowCard;
