import { useState, useMemo, useEffect, FC } from 'react';
import { Menu, CheckSquare, Square, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './HabitsTasks.css';
import { OnNavigateFn, Habit, Task } from './types';

export interface HabitsTasksProps {
  userName?: string;
  onNavigate: OnNavigateFn;
}

export interface GitHubHeatmapDay {
  id: number;
  date: Date;
  dateStr: string;
  count: number;
  level: number;
}

const generateYearHeatmapData = (year: number, activityLog: Record<string, number>): GitHubHeatmapDay[] => {
  const startDate = new Date(year, 0, 1);
  const days: GitHubHeatmapDay[] = [];

  for (let i = 0; i < 364; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const count = activityLog[dateKey] || 0;

    days.push({
      id: i,
      date: d,
      dateStr: dateKey,
      count,
      level: Math.min(count, 4)
    });
  }
  return days;
};

const HabitsTasks: FC<HabitsTasksProps> = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newHabitTitle, setNewHabitTitle] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [hoveredDay, setHoveredDay] = useState<GitHubHeatmapDay | null>(null);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityLog, setActivityLog] = useState<Record<string, number>>({});

  const filters = ['All', 'Study', 'Work', 'Health', 'Challenges'];
  const years = [2026, 2025, 2024];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.habits !== undefined) setHabits(data.habits);
          if (data.tasks !== undefined) setTasks(data.tasks);
          if (data.activityLog !== undefined) setActivityLog(data.activityLog);
        } else {
          setHabits([]);
          setTasks([]);
          setActivityLog({});
        }
      } catch (err) {
        console.error('Failed to fetch user data from Firestore:', err);
      }
    };
    fetchUserData();
  }, []);

  const saveHabits = async (updatedHabits: Habit[], updatedActivityLog?: Record<string, number>) => {
    setHabits(updatedHabits);
    const newLog = updatedActivityLog || activityLog;
    if (updatedActivityLog) setActivityLog(updatedActivityLog);

    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { habits: updatedHabits, activityLog: newLog }, { merge: true });
    } catch (err) {
      console.error('Failed to save habits to Firestore:', err);
    }
  };

  const toggleHabit = (id: number) => {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    let wasCompleted = false;

    const updated = habits.map(h => {
      if (h.id === id) {
        wasCompleted = !h.completed;
        const newStreak = wasCompleted ? (h.streak || 0) + 1 : Math.max(0, (h.streak || 0) - 1);
        return { ...h, completed: wasCompleted, streak: newStreak };
      }
      return h;
    });

    const currentCount = activityLog[todayStr] || 0;
    const newCount = wasCompleted ? currentCount + 1 : Math.max(0, currentCount - 1);
    const updatedActivityLog = { ...activityLog, [todayStr]: newCount };

    saveHabits(updated, updatedActivityLog);
  };

  const handleAddHabit = () => {
    if (!newHabitTitle.trim()) return;
    const category = activeFilter !== 'All' ? activeFilter : 'Health';
    const newHabit: Habit = {
      id: Date.now(),
      title: newHabitTitle.trim(),
      streak: 1,
      category,
      completed: false,
      isActive: true
    };
    const updated = [...habits, newHabit];
    saveHabits(updated);
    setNewHabitTitle('');
    setIsAddModalOpen(false);
  };

  const yearHeatmapData = useMemo(() => generateYearHeatmapData(selectedYear, activityLog), [selectedYear, activityLog]);

  const totalCompletedInYear = useMemo(() => {
    return yearHeatmapData.reduce((sum, d) => sum + d.count, 0);
  }, [yearHeatmapData]);

  const dailyProgressPercent = useMemo(() => {
    const totalItems = habits.length + tasks.length;
    if (totalItems === 0) return 0;
    const completedItems = habits.filter(h => h.completed).length + tasks.filter(t => t.completed).length;
    return Math.round((completedItems / totalItems) * 100);
  }, [habits, tasks]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

        <div className="dashboard-grid habits-stats-grid">
          <GlowCard className="widget-card progress-widget progress-card">
            <h3 className="widget-title">Daily Level Progress</h3>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${dailyProgressPercent}%` }}></div>
              <span className="progress-text">{dailyProgressPercent} %</span>
            </div>
          </GlowCard>
          <GlowCard className="stat-card active-habits-card">
            <h3 className="stat-title">Active Habits</h3>
            <p className="stat-value">{habits.length}</p>
          </GlowCard>
        </div>

        <GlowCard className="habits-main-card">
          <button className="add-habit-btn" onClick={() => setIsAddModalOpen(true)}>
            Add Habit
          </button>

          <div className="filters-row">
            {filters.map(filter => (
              <button 
                key={filter} 
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="habits-split-view">
            
            <div className="habits-list-col">
              <h3 className="habits-col-title">My Habits ({habits.filter(h => activeFilter === 'All' || h.category === activeFilter).length})</h3>
              <div className="habits-scroll-area">
                {habits.filter(h => activeFilter === 'All' || h.category === activeFilter).length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', padding: '1rem 0', margin: 0 }}>
                    No habits created yet. Click 'Add Habit' above to get started!
                  </p>
                ) : (
                  habits.filter(h => activeFilter === 'All' || h.category === activeFilter).map(habit => (
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
                  ))
                )}
              </div>
            </div>

            <div className="github-heatmap-container">
              <div className="github-heatmap-header">
                <h3 className="github-heatmap-title">{totalCompletedInYear} tasks completed in {selectedYear}</h3>
              </div>

              <div className="github-heatmap-wrapper">
                <div className="github-heatmap-box">
                  <div className="github-months-row">
                    <span style={{ width: '28px' }}></span>
                    {months.map(m => (
                      <span key={m} className="github-month-label">{m}</span>
                    ))}
                  </div>

                  <div className="github-matrix-container">
                    <div className="github-days-col">
                      <span className="github-day-label"></span>
                      <span className="github-day-label">Mon</span>
                      <span className="github-day-label"></span>
                      <span className="github-day-label">Wed</span>
                      <span className="github-day-label"></span>
                      <span className="github-day-label">Fri</span>
                      <span className="github-day-label"></span>
                    </div>

                    <div className="github-grid-52">
                      {yearHeatmapData.map(day => (
                        <div
                          key={day.id}
                          className={`github-cell level-${day.level} ${hoveredDay?.id === day.id ? 'hovered' : ''}`}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          title={`${day.count} tasks completed on ${day.dateStr}`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <div className="github-heatmap-footer">
                    <span>
                      {hoveredDay ? (
                        <strong>{hoveredDay.count} tasks completed on {hoveredDay.dateStr}</strong>
                      ) : (
                        'Hover over days to view completion history'
                      )}
                    </span>

                    <div className="github-legend">
                      <span>Less</span>
                      <div className="github-cell level-0 github-legend-cell"></div>
                      <div className="github-cell level-1 github-legend-cell"></div>
                      <div className="github-cell level-2 github-legend-cell"></div>
                      <div className="github-cell level-3 github-legend-cell"></div>
                      <div className="github-cell level-4 github-legend-cell"></div>
                      <span>More</span>
                    </div>
                  </div>
                </div>

                <div className="github-years-list">
                  {years.map(year => (
                    <button
                      key={year}
                      className={`github-year-btn ${selectedYear === year ? 'active' : ''}`}
                      onClick={() => setSelectedYear(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </GlowCard>

      </div>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <GlowCard className="modal-card" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Add Habit</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                title="Cancel"
                className="modal-close-btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s, background-color 0.2s'
                }}
              >
                <X size={20} />
              </button>
            </div>
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
