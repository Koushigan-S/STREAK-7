import { useRef, useEffect, FC } from 'react';
import { ChevronRight } from 'lucide-react';
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
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = sidebar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      sidebar.style.setProperty('--mouse-x', `${x}px`);
      sidebar.style.setProperty('--mouse-y', `${y}px`);
    };

    sidebar.addEventListener('mousemove', handleMouseMove);
    return () => {
      sidebar.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleNav = (view: ViewType) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
      <div className="sidebar-glow-bg"></div>
      
      <div className="sidebar-content">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <ChevronRight size={24} color="var(--accent-color)" />
        </button>

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
  );
};

export default Sidebar;
