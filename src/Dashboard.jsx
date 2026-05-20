import React, { useState } from 'react';
import { Menu, CheckSquare, Square } from 'lucide-react';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './Dashboard.css';

const Dashboard = ({ userName, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Jogging', completed: true },
    { id: 2, title: 'Exercise', completed: true },
    { id: 3, title: 'Brushing Twice', completed: false, isRed: true },
    { id: 4, title: 'Read', completed: true, isRed: true },
    { id: 5, title: 'Practice Badminton', completed: true, isRed: true }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} onNavigate={onNavigate} active="dashboard" />
      
      <div className={`dashboard-main ${isSidebarOpen ? 'shifted' : ''}`}>
        
        {/* Top Bar */}
        <GlowCard className="topbar">
          <button className="topbar-toggle" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="topbar-title">Welcome back, {userName || 'Name'}</h2>
        </GlowCard>

        <div className="dashboard-grid">
          
          {/* Stats Row */}
          <GlowCard className="stat-card">
            <h3 className="stat-title">Current Streak</h3>
            <p className="stat-value">2</p>
          </GlowCard>
          <GlowCard className="stat-card">
            <h3 className="stat-title">Best Streak</h3>
            <p className="stat-value">5</p>
          </GlowCard>
          <GlowCard className="stat-card">
            <h3 className="stat-title">Active Habits</h3>
            <p className="stat-value">5</p>
          </GlowCard>

          {/* Middle Row */}
          <GlowCard className="widget-card progress-widget">
            <h3 className="widget-title">Daily Level Progress</h3>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '10%' }}></div>
              <span className="progress-text">10 %</span>
            </div>
          </GlowCard>
          
          <GlowCard className="widget-card quote-widget">
            <h3 className="widget-title">Quote of the Day</h3>
            <p className="quote-text">" The Strongest Choice Require The Hardest Will "</p>
          </GlowCard>

          {/* Bottom Row */}
          <GlowCard className="widget-card tasks-widget glow-panel">
            <h3 className="widget-title">Today's Task</h3>
            <div className="tasks-list">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`task-item ${task.isRed ? 'task-red-border' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <span className="task-title">{task.title}</span>
                  {task.completed ? <CheckSquare size={20} className="task-icon" /> : <Square size={20} className="task-icon" />}
                </div>
              ))}
            </div>
            <button className="add-task-btn">Add Tasks</button>
          </GlowCard>
          
          <GlowCard className="widget-card diary-widget">
            <h3 className="widget-title">Diary Entry</h3>
            <textarea 
              className="diary-textarea" 
              placeholder="Type your thoughts...."
            ></textarea>
            <button className="add-entry-btn">Add Entry</button>
          </GlowCard>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
