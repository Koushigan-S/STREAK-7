import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './Stats.css';

const Stats = ({ userName, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock Data for Radar Chart
  const radarData = [
    { subject: 'Study', A: 80, fullMark: 100 },
    { subject: 'Others', A: 65, fullMark: 100 },
    { subject: 'Challenges', A: 90, fullMark: 100 },
    { subject: 'Health', A: 85, fullMark: 100 },
    { subject: 'Work', A: 70, fullMark: 100 },
  ];

  return (
    <div className="dashboard-layout stats-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} onNavigate={onNavigate} active="stats" />
      
      <div className={`dashboard-main ${isSidebarOpen ? 'shifted' : ''}`}>
        
        {/* Top Bar */}
        <GlowCard className="topbar">
          <button className="topbar-toggle" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="topbar-title">Stats / Achievements</h2>
        </GlowCard>

        {/* Header Row */}
        <div className="stats-header-row">
          <h1 className="stats-greeting">{userName || 'Name'}, here's a look at your journey so far</h1>
          <GlowCard className="stat-card streak-card">
            <h3 className="stat-title">Current Streak</h3>
            <p className="stat-value">2</p>
          </GlowCard>
        </div>

        {/* Main Grid Layout */}
        <div className="stats-grid">
          
          {/* Left Column: Radar Chart */}
          <GlowCard className="stats-overall-card">
            <h3 className="widget-title overall-title">Overall<br/>Progress</h3>
            <div className="radar-container">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.4)" strokeWidth={2} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#E0E0E0', fontSize: 13, fontWeight: 500 }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar 
                    name="Progress" 
                    dataKey="A" 
                    stroke="#D41111" 
                    strokeWidth={2}
                    fill="#D41111" 
                    fillOpacity={0.6} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlowCard>

          {/* Right Column */}
          <div className="stats-right-col">
            
            {/* Top: Progress Bar */}
            <GlowCard className="widget-card stats-progress-widget">
              <h3 className="widget-title">Daily Level Progress</h3>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: '10%' }}></div>
                <span className="progress-text">10 %</span>
              </div>
            </GlowCard>

            {/* Bottom: Daily Progress List */}
            <GlowCard className="widget-card daily-progress-list-card">
              <h3 className="widget-title">Daily progress</h3>
              
              <div className="daily-progress-box">
                <div className="progress-section">
                  <h4 className="progress-section-title">Completed Task</h4>
                  <ul className="progress-list">
                    <li>Brush Twice</li>
                  </ul>
                </div>
                
                <div className="progress-section">
                  <h4 className="progress-section-title">Yet to complete</h4>
                  <ul className="progress-list">
                    <li>Jogging</li>
                    <li>Exercise</li>
                    <li>Read</li>
                    <li>Practice Badminton</li>
                  </ul>
                </div>
              </div>
            </GlowCard>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Stats;
