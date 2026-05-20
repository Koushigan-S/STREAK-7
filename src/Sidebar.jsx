import React, { useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import GlowCard from './GlowCard';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, onNavigate, active = 'dashboard' }) => {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleMouseMove = (e) => {
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

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
      <div className="sidebar-glow-bg"></div>
      
      <div className="sidebar-content">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <ChevronRight size={24} color="var(--accent-color)" />
        </button>

        <nav className="sidebar-nav">
          <GlowCard className="sidebar-link-wrapper"><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }} className={`sidebar-link ${active === 'dashboard' ? 'active' : ''}`}>Home</a></GlowCard>
          <GlowCard className="sidebar-link-wrapper"><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('habits'); }} className={`sidebar-link ${active === 'habits' ? 'active' : ''}`}>Habits / Tasks</a></GlowCard>
          <GlowCard className="sidebar-link-wrapper"><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('diary'); }} className={`sidebar-link ${active === 'diary' ? 'active' : ''}`}>Diary</a></GlowCard>
          <GlowCard className="sidebar-link-wrapper"><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('stats'); }} className={`sidebar-link ${active === 'stats' ? 'active' : ''}`}>Stats & Achievements</a></GlowCard>
          <GlowCard className="sidebar-link-wrapper"><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('settings'); }} className={`sidebar-link ${active === 'settings' ? 'active' : ''}`}>Settings</a></GlowCard>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
