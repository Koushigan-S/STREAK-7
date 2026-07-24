import { useState, useRef, useEffect, FC } from 'react';
import { Menu, PlusCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './Diary.css';
import { OnNavigateFn, DiaryEntry } from './types';

export interface DiaryProps {
  userName?: string;
  onNavigate: OnNavigateFn;
}

type CalendarView = 'days' | 'months' | 'years';

const defaultPastEntries: DiaryEntry[] = [
  { id: 1, date: 'October 23, 2025', title: 'A busy day', snippet: 'Had a lot of work to do...' },
  { id: 2, date: 'October 22, 2025', title: 'Relaxing sunday', snippet: 'Slept in until 10am...' },
  { id: 3, date: 'October 20, 2025', title: 'Gym progress', snippet: 'Hit a new personal record!' },
  { id: 4, date: 'October 18, 2025', title: 'Feeling Inspired', snippet: 'Today was a good day! I felt...' }
];

const Diary: FC<DiaryProps> = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(4);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarView, setCalendarView] = useState<CalendarView>('days');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2027, 3, 1));
  const [newEntryText, setNewEntryText] = useState<string>('');
  const [entries, setEntries] = useState<DiaryEntry[]>(defaultPastEntries);
  
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 12 }, (_, i) => 2021 + i);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!auth.currentUser) return;
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().diaryEntries) {
          setEntries(userDoc.data().diaryEntries);
        }
      } catch (err) {
        console.error('Failed to load diary entries from Firestore:', err);
      }
    };
    fetchEntries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
        setCalendarView('days');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddEntry = async () => {
    if (!newEntryText.trim()) return;
    const newEntry: DiaryEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      title: newEntryText.trim().slice(0, 25) + '...',
      snippet: newEntryText.trim()
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    setNewEntryText('');
    setExpandedEntryId(newEntry.id);

    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, { diaryEntries: updatedEntries }, { merge: true });
      } catch (err) {
        console.error('Failed to save entry to Firestore:', err);
      }
    }
  };

  const toggleEntry = (id: number) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  const handleMonthSelect = (monthIdx: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIdx, 1));
    setCalendarView('days');
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setCalendarView('days');
  };

  return (
    <div className="dashboard-layout diary-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} onNavigate={onNavigate} active="diary" />
      
      <div className={`dashboard-main ${isSidebarOpen ? 'shifted' : ''}`}>
        
        {/* Top Bar */}
        <GlowCard className="topbar">
          <button className="topbar-toggle" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="topbar-title">Diary</h2>
        </GlowCard>

        {/* New Entry Section */}
        <GlowCard className="diary-editor-card">
          <div className="diary-textarea-container">
            <textarea 
              className="diary-textarea-large" 
              placeholder="Type your thoughts...."
              value={newEntryText}
              onChange={(e) => setNewEntryText(e.target.value)}
            ></textarea>
          </div>
          <div className="diary-actions">
            <button className="new-entry-btn" onClick={handleAddEntry}>
              New Entry <PlusCircle size={18} />
            </button>
          </div>
        </GlowCard>

        {/* Past Entries Section */}
        <div className="past-entries-section">
          <div className="past-entries-header">
            <span>Past Entries</span>
            <div className="calendar-icon-btn" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
              <CalendarIcon size={20} />
            </div>

            {/* Custom Calendar Popover */}
            {isCalendarOpen && (
              <div className="calendar-popover" ref={calendarRef}>
                <div className="calendar-header">
                  <div className="calendar-title-selectors">
                    <span 
                      className="calendar-month-selector"
                      onClick={() => setCalendarView(calendarView === 'months' ? 'days' : 'months')}
                    >
                      {months[currentDate.getMonth()]}
                    </span>
                    <span 
                      className="calendar-year-selector"
                      onClick={() => setCalendarView(calendarView === 'years' ? 'days' : 'years')}
                    >
                      {currentDate.getFullYear()} <ChevronDown size={14} />
                    </span>
                  </div>
                  <div className="calendar-nav-arrows">
                    <ChevronLeft size={16} className="nav-arrow" />
                    <ChevronRight size={16} className="nav-arrow" />
                  </div>
                </div>

                <div className="calendar-body">
                  <div className="calendar-weekdays">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                  <div className="calendar-grid">
                    {[28, 29, 30, 31].map(d => <div key={`prev-${d}`} className="calendar-day prev-month">{d}</div>)}
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                      <div key={d} className="calendar-day">{d}</div>
                    ))}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(d => <div key={`next-${d}`} className="calendar-day prev-month">{d}</div>)}
                  </div>
                </div>

                {calendarView === 'months' && (
                  <div className="calendar-dropdown month-dropdown">
                    {months.map((m, idx) => (
                      <div 
                        key={m} 
                        className={`dropdown-item ${currentDate.getMonth() === idx ? 'active-red' : ''}`}
                        onClick={() => handleMonthSelect(idx)}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}

                {calendarView === 'years' && (
                  <div className="calendar-dropdown year-dropdown">
                    {years.map(y => (
                      <div 
                        key={y} 
                        className={`dropdown-item ${currentDate.getFullYear() === y ? 'active-white' : ''}`}
                        onClick={() => handleYearSelect(y)}
                      >
                        {y}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="past-entries-list">
            {entries.map(entry => (
              <div 
                key={entry.id} 
                className={`past-entry-item ${expandedEntryId === entry.id ? 'expanded' : ''}`}
                onClick={() => toggleEntry(entry.id)}
              >
                <div className="past-entry-date">{entry.date}</div>
                {expandedEntryId === entry.id && (
                  <div className="past-entry-details">
                    <h3 className="past-entry-title">{entry.title}</h3>
                    <p className="past-entry-snippet">{entry.snippet}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Diary;
