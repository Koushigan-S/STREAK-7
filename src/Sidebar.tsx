import { FC } from 'react';
import { ChevronLeft } from 'lucide-react';
import GlowCard from './GlowCard';
import './Sidebar.css';
import { OnNavigateFn, ViewType } from './types';

export interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onNavigate?: OnNavigateFn;
  active?: ViewType;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, toggleSidebar, onNavigate, active = 'dashboard' }) => {
  const handleNav = (view: ViewType) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar} />
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
            <img src="/favicon.png" alt="Streak 7 Mascot" style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', letterSpacing: '0.5px' }}>STREAK 7</h2>
            <button className="sidebar-toggle-btn" onClick={toggleSidebar} style={{ marginLeft: 'auto', marginBottom: 0 }}>
              <ChevronLeft size={22} color="var(--color-primary)" />
            </button>
          </div>

          <nav className="sidebar-nav">
            <GlowCard className="sidebar-link-wrapper">
              <a href="#" onClick={(e) => { e.preventDefault(); handleNav('dashboard'); }} className={`sidebar-link ${active === 'dashboard' ? 'active' : ''}`}>Home</a>
            </GlowCard>
            <GlowCard className="sidebar-link-wrapper">
              <a href="#" onClick={(e) => { e.preventDefault(); handleNav('habits'); }} className={`sidebar-link ${active === 'habits' ? 'active' : ''}`}>Habits / Tasks</a>
            </GlowCard>
            <GlowCard className="sidebar-link-wrapper">
              <a href="#" onClick={(e) => { e.preventDefault(); handleNav('diary'); }} className={`sidebar-link ${active === 'diary' ? 'active' : ''}`}>Diary</a>
            </GlowCard>
            <GlowCard className="sidebar-link-wrapper">
              <a href="#" onClick={(e) => { e.preventDefault(); handleNav('stats'); }} className={`sidebar-link ${active === 'stats' ? 'active' : ''}`}>Stats & Achievements</a>
            </GlowCard>
            <GlowCard className="sidebar-link-wrapper">
              <a href="#" onClick={(e) => { e.preventDefault(); handleNav('settings'); }} className={`sidebar-link ${active === 'settings' ? 'active' : ''}`}>Settings</a>
            </GlowCard>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
