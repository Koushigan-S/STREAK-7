import { useState, useMemo, useEffect, FC } from 'react';
import { Menu, CheckSquare, Square } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './HabitsTasks.css';
import { OnNavigateFn, Habit, HeatmapDay } from './types';

export interface HabitsTasksProps {
  userName?: string;
  onNavigate: OnNavigateFn;
}

const defaultHabits: Habit[] = [
  { id: 1, title: 'Jogging', streak: 4, category: 'Health', completed: true },
  { id: 2, title: 'Exercise', streak: 2, category: 'Health', completed: true },
  { id: 3, title: 'Brush Twice', streak: 3, category: 'Health', completed: false, isActive: true },
  { id: 4, title: 'Read', streak: 6, category: 'Study', completed: true },
  { id: 5, title: 'Badminton', streak: 1, category: 'Challenges', completed: true }
];

const HabitsTasks: FC<HabitsTasksProps> = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newHabitTitle, setNewHabitTitle] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);

  const filters = ['All', 'Study', 'Work', 'Health', 'Challenges', 'Heatmap'];

  const heatmapData: HeatmapDay[] = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    id: i,
    date: new Date(2025, 9, 23 - (70 - i)),
    count: (i * 7 + 3) % 6,
  })), []);

  useEffect(() => {
    const fetchHabits = async () => {
      if (!auth.currentUser) return;
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().habits) {
          setHabits(userDoc.data().habits);
        }
      } catch (err) {
        console.error('Failed to fetch habits from Firestore:', err);
      }
    };
    fetchHabits();
  }, []);

  const saveHabits = async (updated: Habit[]) => {
    setHabits(updated);
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { habits: updated }, { merge: true });
    } catch (err) {
      console.error('Failed to save habits to Firestore:', err);
    }
  };

  const toggleHabit = (id: number) => {
    const updated = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    saveHabits(updated);
  };

  const handleAddHabit = () => {
    if (!newHabitTitle.trim()) return;
    const newHabit: Habit = {
      id: Date.now(),
      title: newHabitTitle.trim(),
      streak: 1,
      category: activeFilter !== 'All' && activeFilter !== 'Heatmap' ? activeFilter : 'Health',
      completed: false,
    };
    saveHabits([...habits, newHabit]);
    setNewHabitTitle('');
    setIsAddModalOpen(false);
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
            <p className="stat-value">{habits.length}</p>
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
                  <div style={{ height: '20px' }}></div>
                )}
              </div>
              
              <div className="heatmap-grid">
                {heatmapData.map((day) => (
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
                  `${hoveredDay.count} Habits done on October 23,2025`
                ) : (
                  `${habits.filter(h => h.completed).length} Habits Done Today`
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
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
              autoFocus
            />
            <button className="modal-submit-btn" onClick={handleAddHabit}>
              Add
            </button>
          </GlowCard>
        </div>
      )}
    </div>
  );
};

export default HabitsTasks;
