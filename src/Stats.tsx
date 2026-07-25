import { useState, useEffect, useMemo, FC } from 'react';
import { Menu } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './Stats.css';
import { OnNavigateFn, RadarSubject, Habit, Task } from './types';

export interface StatsProps {
  userName?: string;
  onNavigate: OnNavigateFn;
}

const Stats: FC<StatsProps> = ({ userName, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

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
        } else {
          setHabits([]);
          setTasks([]);
        }
      } catch (err) {
        console.error('Failed to fetch user data for Stats:', err);
      }
    };
    fetchUserData();
  }, []);

  const currentStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    const max = Math.max(...habits.map(h => h.streak || 0));
    return max > 0 ? max : 0;
  }, [habits]);

  const radarData: RadarSubject[] = useMemo(() => {
    const categories = ['Study', 'Others', 'Challenges', 'Health', 'Work'];
    return categories.map(cat => {
      const catHabits = habits.filter(h => h.category === cat);
      if (catHabits.length === 0) return { subject: cat, A: 0, fullMark: 100 };
      const completed = catHabits.filter(h => h.completed).length;
      return { subject: cat, A: Math.round((completed / catHabits.length) * 100), fullMark: 100 };
    });
  }, [habits]);

  const dailyProgressPercent = useMemo(() => {
    const totalItems = habits.length + tasks.length;
    if (totalItems === 0) return 0;
    const completedItems = habits.filter(h => h.completed).length + tasks.filter(t => t.completed).length;
    return Math.round((completedItems / totalItems) * 100);
  }, [habits, tasks]);

  const completedList = useMemo(() => {
    const habitTitles = habits.filter(h => h.completed).map(h => h.title);
    const taskTitles = tasks.filter(t => t.completed).map(t => t.title);
    return [...habitTitles, ...taskTitles];
  }, [habits, tasks]);

  const yetToCompleteList = useMemo(() => {
    const habitTitles = habits.filter(h => !h.completed).map(h => h.title);
    const taskTitles = tasks.filter(t => !t.completed).map(t => t.title);
    return [...habitTitles, ...taskTitles];
  }, [habits, tasks]);

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
            <p className="stat-value">{currentStreak}</p>
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
                  <PolarGrid stroke="var(--color-border)" strokeWidth={1.5} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'var(--color-heading)', fontSize: 13, fontWeight: 600 }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar 
                    name="Progress" 
                    dataKey="A" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2.5}
                    fill="var(--color-primary)" 
                    fillOpacity={0.45} 
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
                <div className="progress-bar-fill" style={{ width: `${dailyProgressPercent}%` }}></div>
                <span className="progress-text">{dailyProgressPercent} %</span>
              </div>
            </GlowCard>

            {/* Bottom: Daily Progress List */}
            <GlowCard className="widget-card daily-progress-list-card">
              <h3 className="widget-title">Daily progress</h3>
              
              <div className="daily-progress-box">
                <div className="progress-section">
                  <h4 className="progress-section-title">Completed Task</h4>
                  {completedList.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', margin: 0 }}>None completed yet today</p>
                  ) : (
                    <ul className="progress-list">
                      {completedList.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="progress-section">
                  <h4 className="progress-section-title">Yet to complete</h4>
                  {yetToCompleteList.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', margin: 0 }}>All caught up for today!</p>
                  ) : (
                    <ul className="progress-list">
                      {yetToCompleteList.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
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
