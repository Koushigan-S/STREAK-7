import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './Settings.css';

const Settings = ({ userName, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(userName || 'Name');

  const avatarLetter = (userName || 'Name').charAt(0).toUpperCase();

  const handleSave = () => {
    setIsEditing(false);
    // Update global state and stay on the settings page
    onNavigate('settings', { name: inputValue });
  };

  const handleSignOut = () => {
    onNavigate('signin');
  };

  return (
    <div className="dashboard-layout settings-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} onNavigate={onNavigate} active="settings" />
      
      <div className={`dashboard-main ${isSidebarOpen ? 'shifted' : ''}`}>
        
        {/* Top Bar */}
        <GlowCard className="topbar">
          <button className="topbar-toggle" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="topbar-title">Settings</h2>
        </GlowCard>

        {/* Settings Content */}
        <div className="settings-content-area">
          
          <div className="settings-avatar-circle">
            {avatarLetter}
          </div>

          <GlowCard className="settings-display-name-card">
            {isEditing ? (
              <div className="display-name-edit-mode">
                <span className="settings-label">Display Name</span>
                <input 
                  type="text" 
                  className="display-name-input" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                />
                <button className="settings-btn-primary full-width" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="display-name-read-mode">
                <div className="display-name-info">
                  <span className="settings-label">Display Name</span>
                  <span className="settings-value">{userName || 'Name'}</span>
                </div>
                <button className="settings-btn-primary" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              </div>
            )}
          </GlowCard>

        </div>

        {/* Fixed Sign Out Button */}
        <div className="settings-footer">
          <button className="settings-btn-primary full-width signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
