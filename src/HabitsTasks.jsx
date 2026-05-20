import React, { useState } from 'react';
import { Menu, CheckSquare, Square, Check } from 'lucide-react';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './HabitsTasks.css';

const HabitsTasks = ({ userName, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredDay, setHoveredDay] = useState(null);
  
  const [habits, setHabits] = useState([
    { id: 1, title: 'Jogging', streak: 4, category: 'Health', completed: true },
    { id: 2, title: 'Exercise', streak: 2, category: 'Health', completed: true },
    { id: 3, title: 'Brush Twice', streak: 3, category: 'Health', completed: false, isActive: true },
    { id: 4, title: 'Read', streak: 6, category: 'Study', completed: true },
    { id: 5, title: 'Badminton', streak: 1, category: 'Challenges', completed: true }
  ]);

  const filters = ['All', 'Study', 'Work', 'Health', 'Challenges', 'Heatmap'];

  // Generate mock heatmap data (10 cols x 7 rows)
  const heatmapData = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    date: new Date(2025, 9, 23 - (70 - i)), // Mock dates starting from some point
    count: Math.floor(Math.random() * 6), // 0 to 5 activities
  }));

  const toggleHabit = (id) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  return (
    <div className="dashboard-layout habits-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} onNavigate={onNavigate} active="habits" />
      
      <div className={`dashboard-main ${isSidebarOpen ? 'shifted' : ''}`}>
        
        {/* Top Bar */}
        <GlowCard className="topbar">
          <button className="topbar-toggle" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="topbar-title">Habits / Tasks</h2>
        </GlowCard>

        {/* Stats Row */}
        <div className="dashboard-grid habits-stats-grid">
          <GlowCard className="stat-card progress-card">
            <h3 className="widget-title">Daily Level Progress</h3>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '10%' }}></div>
              <span className="progress-text">10 %</span>
            </div>
          </GlowCard>
          <GlowCard className="stat-card active-habits-card">
            <h3 className="stat-title">Active Habits</h3>
            <p className="stat-value">5</p>
          </GlowCard>
        </div>

        {/* Main Content Area */}
        <GlowCard className="habits-main-card">
          <button className="add-habit-btn" onClick={() => setIsAddModalOpen(true)}>
            Add Habit
          </button>

          <div className="filters-row">
            {filters.map(filter => (
              <button 
                key={filter} 
                className={`filter-btn ${activeFilter === filter && filter !== 'Heatmap' ? 'active' : ''} ${filter === 'All' && activeFilter === 'All' ? 'all-active' : ''}`}
                onClick={() => filter !== 'Heatmap' && setActiveFilter(filter)}
                style={{ cursor: filter === 'Heatmap' ? 'default' : 'pointer' }}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="habits-split-view">
            
            {/* Left: Habits List */}
            <div className="habits-list-col">
              <div className="habits-scroll-area">
                {habits.filter(h => activeFilter === 'All' || h.category === activeFilter).map(habit => (
                  <div 
                    key={habit.id} 
                    className={`habit-list-item ${habit.isActive ? 'active-border' : ''}`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <div className="habit-item-left">
                      {habit.completed ? <CheckSquare size={20} className="task-icon" /> : <Square size={20} className="task-icon" />}
                      <div className="habit-info">
                        <span className="habit-title">{habit.title}</span>
                        <span className="habit-streak">( {habit.streak} Day Streak)</span>
                      </div>
                    </div>
                    <div className="habit-category-tag">
                      {habit.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Heatmap */}
            <div className="heatmap-col">
              <div className="heatmap-header">
                {hoveredDay ? (
                  <>
                    <span>OCT</span>
                    <span>NOV</span>
                  </>
                ) : (
                  <div style={{ height: '20px' }}></div> /* Spacer to prevent layout shift */
                )}
              </div>
              
              <div className="heatmap-grid">
                {heatmapData.map((day, idx) => (
                  <div 
                    key={day.id} 
                    className={`heatmap-cell ${hoveredDay?.id === day.id ? 'hovered' : ''}`}
                    style={{
                      backgroundColor: day.count > 0 ? `rgba(212, 17, 17, ${0.2 + (day.count * 0.16)})` : 'rgba(255, 255, 255, 0.6)'
                    }}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  ></div>
                ))}
              </div>

              <div className="heatmap-footer">
                {hoveredDay ? (
                  `${hoveredDay.count} Habits done on October 23,2025` // Mocking date text
                ) : (
                  "4 Habits Done Today"
                )}
              </div>
            </div>

          </div>
        </GlowCard>

      </div>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <GlowCard className="modal-card">
            <h3 className="modal-title">Add Habit</h3>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="Enter Habit" 
              autoFocus
            />
            <button className="modal-submit-btn" onClick={() => setIsAddModalOpen(false)}>
              Add
            </button>
          </GlowCard>
        </div>
      )}
    </div>
  );
};

export default HabitsTasks;
