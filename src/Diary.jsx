import React, { useState, useRef, useEffect } from 'react';
import { Menu, PlusCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './Diary.css';

const Diary = ({ userName, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState(4); // October 18 expanded by default
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const [calendarView, setCalendarView] = useState('days'); // 'days', 'months', 'years'
  const [currentDate, setCurrentDate] = useState(new Date(2027, 3, 1)); // April 2027 based on mockup
  
  const calendarRef = useRef(null);

  const pastEntries = [
    { id: 1, date: 'October 23,2025', title: 'A busy day', snippet: 'Had a lot of work to do...' },
    { id: 2, date: 'October 22,2025', title: 'Relaxing sunday', snippet: 'Slept in until 10am...' },
    { id: 3, date: 'October 20,2025', title: 'Gym progress', snippet: 'Hit a new personal record!' },
    { id: 4, date: 'October 18,2025', title: 'Feeling Inspired', snippet: 'Today was a good day! I felt...' }
  ];

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 12 }, (_, i) => 2021 + i); // 2021 to 2032

  // Close calendar if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
        setCalendarView('days');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleEntry = (id) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  const handleMonthSelect = (monthIdx) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIdx, 1));
    setCalendarView('days');
  };

  const handleYearSelect = (year) => {
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
            ></textarea>
          </div>
          <div className="diary-actions">
            <button className="new-entry-btn">
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
                    {/* Mock dates for April 2027 */}
                    {[28, 29, 30, 31].map(d => <div key={`prev-${d}`} className="calendar-day prev-month">{d}</div>)}
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                      <div key={d} className="calendar-day">{d}</div>
                    ))}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(d => <div key={`next-${d}`} className="calendar-day prev-month">{d}</div>)}
                  </div>
                </div>

                {/* Dropdowns */}
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
            {pastEntries.map(entry => (
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
