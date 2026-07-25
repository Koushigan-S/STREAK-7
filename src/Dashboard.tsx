import { useState, useEffect, useMemo, FC } from 'react';
import { Menu, CheckSquare, Square } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './Dashboard.css';
import { OnNavigateFn, Task, Habit } from './types';
import { getDailyQuote, Quote } from './quotes';

export interface DashboardProps {
  userName?: string;
  onNavigate: OnNavigateFn;
}

const Dashboard: FC<DashboardProps> = ({ userName, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [showAddTaskInput, setShowAddTaskInput] = useState<boolean>(false);
  const [diaryInput, setDiaryInput] = useState<string>('');

  const currentQuote: Quote = useMemo(() => getDailyQuote(), []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.tasks !== undefined) setTasks(data.tasks);
          if (data.habits !== undefined) setHabits(data.habits);
        } else {
          setTasks([]);
          setHabits([]);
        }
      } catch (err) {
        console.error('Firestore load error:', err);
      }
    };
    fetchUserData();
  }, []);

  const saveTasksToFirestore = async (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { tasks: updatedTasks }, { merge: true });
    } catch (err) {
      console.error('Firestore save error:', err);
    }
  };

  const toggleTask = (id: number) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasksToFirestore(updated);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
      isRed: true
    };
    const updated = [...tasks, newTask];
    saveTasksToFirestore(updated);
    setNewTaskTitle('');
    setShowAddTaskInput(false);
  };

  const handleAddDiaryEntry = async () => {
    if (!diaryInput.trim() || !auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const existingEntries = userDoc.exists() && userDoc.data().diaryEntries ? userDoc.data().diaryEntries : [];
      const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        title: diaryInput.trim().slice(0, 25) + '...',
        snippet: diaryInput.trim()
      };
      await setDoc(userDocRef, { diaryEntries: [newEntry, ...existingEntries] }, { merge: true });
      setDiaryInput('');
      onNavigate('diary');
    } catch (err) {
      console.error('Failed to add diary entry:', err);
    }
  };

  // Real-Time Stats Calculations
  const currentStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    const maxStreak = Math.max(...habits.map(h => h.streak || 0));
    return maxStreak > 0 ? maxStreak : 0;
  }, [habits]);

  const bestStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => h.streak || 0));
  }, [habits]);

  const activeHabitsCount = useMemo(() => habits.length, [habits]);

  const progressPercent = useMemo(() => {
    const totalItems = tasks.length + habits.length;
    if (totalItems === 0) return 0;
    const completedItems = tasks.filter(t => t.completed).length + habits.filter(h => h.completed).length;
    return Math.round((completedItems / totalItems) * 100);
  }, [tasks, habits]);

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
            <p className="stat-value">{currentStreak}</p>
          </GlowCard>
          <GlowCard className="stat-card">
            <h3 className="stat-title">Best Streak</h3>
            <p className="stat-value">{bestStreak}</p>
          </GlowCard>
          <GlowCard className="stat-card">
            <h3 className="stat-title">Active Habits</h3>
            <p className="stat-value">{activeHabitsCount}</p>
          </GlowCard>

          {/* Middle Row */}
          <GlowCard className="widget-card progress-widget">
            <h3 className="widget-title">Daily Level Progress</h3>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              <span className="progress-text">{progressPercent} %</span>
            </div>
          </GlowCard>
          
          <GlowCard className="widget-card quote-widget">
            <h3 className="widget-title">Quote of the Day</h3>
            <p className="quote-text">"{currentQuote.quote}"</p>
            <p style={{ marginTop: '0.75rem', marginBottom: 0, textAlign: 'right', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>— {currentQuote.author}</p>
          </GlowCard>

          {/* Bottom Row */}
          <GlowCard className="widget-card tasks-widget glow-panel">
            <h3 className="widget-title">Today's Task</h3>
            <div className="tasks-list">
              {tasks.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 'auto 0' }}>
                  No tasks created for today yet.
                </p>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`task-item ${task.isRed ? 'task-red-border' : ''}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <span className="task-title">{task.title}</span>
                    {task.completed ? <CheckSquare size={20} className="task-icon" /> : <Square size={20} className="task-icon" />}
                  </div>
                ))
              )}
            </div>
            
            {showAddTaskInput ? (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  autoFocus
                />
                <button className="add-task-btn" style={{ margin: 0, width: 'auto' }} onClick={handleAddTask}>Add</button>
              </div>
            ) : (
              <button className="add-task-btn" onClick={() => setShowAddTaskInput(true)}>Add Tasks</button>
            )}
          </GlowCard>
          
          <GlowCard className="widget-card diary-widget">
            <h3 className="widget-title">Diary Entry</h3>
            <textarea 
              className="diary-textarea" 
              placeholder="Type your thoughts...."
              value={diaryInput}
              onChange={(e) => setDiaryInput(e.target.value)}
            ></textarea>
            <button className="add-entry-btn" onClick={handleAddDiaryEntry}>Add Entry</button>
          </GlowCard>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
