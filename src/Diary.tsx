import { useState, useRef, useEffect, useMemo, FC } from 'react';
import { Menu, PlusCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Trash2, Edit3 } from 'lucide-react';
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

interface CalendarGridItem {
  dayNum: number;
  isCurrentMonth: boolean;
}

const Diary: FC<DiaryProps> = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarView, setCalendarView] = useState<CalendarView>('days');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedFilterDate, setSelectedFilterDate] = useState<string | null>(null);
  const [newEntryText, setNewEntryText] = useState<string>('');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [editText, setEditText] = useState<string>('');
  
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const carouselTrackRef = useRef<HTMLDivElement | null>(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const today = useMemo(() => new Date(), []);
  const currentRealYear = today.getFullYear();

  const isEntryFromToday = (entryDate: string) => {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return entryDate === todayStr;
  };
  
  // Real-time years: up to present year only (no future years)
  const years = useMemo(() => {
    const startYear = 2020;
    const count = Math.max(1, currentRealYear - startYear + 1);
    return Array.from({ length: count }, (_, i) => startYear + i);
  }, [currentRealYear]);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!auth.currentUser) return;
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().diaryEntries !== undefined) {
          setEntries(userDoc.data().diaryEntries);
        } else {
          setEntries([]);
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
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { diaryEntries: updatedEntries }, { merge: true });
    } catch (err) {
      console.error('Failed to save diary entry to Firestore:', err);
    }
  };

  const handleDeleteEntry = async (entryId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = entries.find(item => item.id === entryId);
    if (!target || !isEntryFromToday(target.date)) return; // Strictly only allow deleting today's entry

    const updatedEntries = entries.filter(item => item.id !== entryId);
    setEntries(updatedEntries);
    if (viewingEntry?.id === entryId) setViewingEntry(null);
    if (editingEntry?.id === entryId) setEditingEntry(null);

    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { diaryEntries: updatedEntries }, { merge: true });
    } catch (err) {
      console.error('Failed to delete entry from Firestore:', err);
    }
  };

  const handleStartEdit = (entry: DiaryEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isEntryFromToday(entry.date)) return; // Strictly only present day's entry
    setEditingEntry(entry);
    setEditText(entry.snippet);
    setViewingEntry(null);
  };

  const handleSaveRewrite = async () => {
    if (!editingEntry) return;
    const updatedText = editText.trim();
    if (!updatedText) return;

    const updatedEntries = entries.map(item => {
      if (item.id === editingEntry.id) {
        return {
          ...item,
          title: updatedText.slice(0, 25) + '...',
          snippet: updatedText
        };
      }
      return item;
    });

    setEntries(updatedEntries);
    setEditingEntry(null);

    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { diaryEntries: updatedEntries }, { merge: true });
    } catch (err) {
      console.error('Failed to save rewritten entry to Firestore:', err);
    }
  };

  const isCurrentOrFutureMonth = useMemo(() => {
    return (
      currentDate.getFullYear() > today.getFullYear() ||
      (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() >= today.getMonth())
    );
  }, [currentDate, today]);

  const handleMonthSelect = (monthIndex: number) => {
    if (currentDate.getFullYear() === today.getFullYear() && monthIndex > today.getMonth()) {
      return;
    }
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setCalendarView('days');
  };

  const handleYearSelect = (year: number) => {
    if (year > today.getFullYear()) return;
    const targetMonth = year === today.getFullYear() ? Math.min(currentDate.getMonth(), today.getMonth()) : currentDate.getMonth();
    setCurrentDate(new Date(year, targetMonth, 1));
    setCalendarView('days');
  };

  const changeMonth = (delta: number) => {
    if (delta > 0 && isCurrentOrFutureMonth) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const calendarGridDays: CalendarGridItem[] = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const startingOffset = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: CalendarGridItem[] = [];

    for (let i = startingOffset - 1; i >= 0; i--) {
      days.push({
        dayNum: prevMonthDays - i,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const isTodayDay = (dayNum: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    return (
      today.getDate() === dayNum &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const isFutureDay = (dayNum: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    dayDate.setHours(0, 0, 0, 0);

    return dayDate.getTime() > startOfToday.getTime();
  };

  const isSelectedDay = (dayNum: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !selectedFilterDate) return false;
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    const dStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return selectedFilterDate === dStr;
  };

  const handleDayClick = (dayNum: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    if (isFutureDay(dayNum, isCurrentMonth)) return;

    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    const dStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    setSelectedFilterDate(dStr);
    
    setCurrentDate(new Date());
    setIsCalendarOpen(false);
  };

  const handleClearFilter = () => {
    setSelectedFilterDate(null);
    setCurrentDate(new Date());
  };

  const filteredEntries = useMemo(() => {
    if (!selectedFilterDate) return entries;
    return entries.filter(e => e.date === selectedFilterDate);
  }, [entries, selectedFilterDate]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselTrackRef.current) return;
    const amount = direction === 'left' ? -320 : 320;
    carouselTrackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleMouseMoveOnTrack = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = carouselTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
    const maxScroll = track.scrollWidth - track.clientWidth;
    track.scrollLeft = percentage * maxScroll;
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

        {/* Diary Entries Carousel Section */}
        <div className="past-entries-section">
          <div className="past-entries-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span>Diary Entries ({filteredEntries.length})</span>
              {selectedFilterDate && (
                <div className="active-filter-pill">
                  <span>{selectedFilterDate}</span>
                  <button onClick={handleClearFilter} title="Clear filter">✕</button>
                </div>
              )}
            </div>

            <div className="calendar-icon-btn" onClick={() => setIsCalendarOpen(!isCalendarOpen)} title="Filter entries by calendar date">
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
                    <ChevronLeft size={18} className="nav-arrow" onClick={() => changeMonth(-1)} />
                    <ChevronRight 
                      size={18} 
                      className={`nav-arrow ${isCurrentOrFutureMonth ? 'disabled' : ''}`} 
                      onClick={() => changeMonth(1)} 
                    />
                  </div>
                </div>

                <div className="calendar-body">
                  <div className="calendar-weekdays">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                  <div className="calendar-grid">
                    {calendarGridDays.map((item: CalendarGridItem, idx: number) => {
                      const todayClass = isTodayDay(item.dayNum, item.isCurrentMonth) ? 'today' : '';
                      const selectedClass = isSelectedDay(item.dayNum, item.isCurrentMonth) ? 'selected' : '';
                      const futureClass = isFutureDay(item.dayNum, item.isCurrentMonth) ? 'future' : '';
                      const prevClass = !item.isCurrentMonth ? 'prev-month' : '';

                      return (
                        <div 
                          key={idx} 
                          className={`calendar-day ${todayClass} ${selectedClass} ${futureClass} ${prevClass}`}
                          onClick={() => handleDayClick(item.dayNum, item.isCurrentMonth)}
                        >
                          {item.dayNum}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {calendarView === 'months' && (
                  <div className="calendar-dropdown month-dropdown">
                    {months.map((m, idx) => {
                      const isFutureMonth = currentDate.getFullYear() === today.getFullYear() && idx > today.getMonth();
                      return (
                        <div 
                          key={m} 
                          className={`dropdown-item ${currentDate.getMonth() === idx ? 'active-red' : ''} ${isFutureMonth ? 'disabled' : ''}`}
                          onClick={() => !isFutureMonth && handleMonthSelect(idx)}
                        >
                          {m}
                        </div>
                      );
                    })}
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

          {/* Diary Entries Carousel / No Entries Box */}
          {filteredEntries.length === 0 ? (
            <div className="no-entries-box">
              <p>No Entires were made on that day by you</p>
              <button className="reset-filter-btn" onClick={handleClearFilter}>
                Show All Diary Entries
              </button>
            </div>
          ) : (
            <>
              <div className="past-entries-carousel-container">
                <button className="carousel-nav-btn prev" onClick={() => scrollCarousel('left')} aria-label="Previous Entries">
                  <ChevronLeft size={20} />
                </button>

                <div 
                  className="past-entries-carousel-track" 
                  ref={carouselTrackRef}
                  onMouseMove={handleMouseMoveOnTrack}
                >
                  {filteredEntries.map((entry: DiaryEntry, index: number) => (
                    <div 
                      key={entry.id} 
                      className={`carousel-card ${hoveredIndex === index ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setViewingEntry(entry)}
                    >
                      <div className="carousel-card-badge-row">
                        <span className="carousel-card-badge">{entry.date}</span>
                        {isEntryFromToday(entry.date) && (
                          <div className="card-actions">
                            <button 
                              className="card-action-icon-btn edit" 
                              onClick={(e) => handleStartEdit(entry, e)}
                              title="Rewrite present day entry"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button 
                              className="card-action-icon-btn delete" 
                              onClick={(e) => handleDeleteEntry(entry.id, e)}
                              title="Delete present day entry"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>

                      <h3 className="carousel-card-title">{entry.title}</h3>
                      <p className="carousel-card-snippet">{entry.snippet}</p>
                      
                      <div 
                        className="carousel-card-footer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingEntry(entry);
                        }}
                      >
                        <span>Read entry</span> <ChevronRight size={14} />
                      </div>
                    </div>
                  ))}
                </div>

                <button className="carousel-nav-btn next" onClick={() => scrollCarousel('right')} aria-label="Next Entries">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="carousel-indicators">
                {filteredEntries.map((entry: DiaryEntry, index: number) => (
                  <button 
                    key={entry.id} 
                    className={`indicator-dot ${hoveredIndex === index ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setViewingEntry(entry)}
                    title={entry.date}
                  ></button>
                ))}
              </div>
            </>
          )}

        </div>

      </div>

      {/* Read Entry Modal Dialog */}
      {viewingEntry && (
        <div className="modal-overlay" onClick={() => setViewingEntry(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '550px' }}>
            <GlowCard className="diary-entry-modal-card">
              <div className="diary-entry-modal-header">
                <span className="diary-entry-modal-date">{viewingEntry.date}</span>
                <button className="diary-modal-close-btn" onClick={() => setViewingEntry(null)}>✕</button>
              </div>
              <h2 className="diary-entry-modal-title">{viewingEntry.title}</h2>
              <div className="diary-entry-modal-body">
                <p>{viewingEntry.snippet}</p>
              </div>
              <div className="modal-footer-row">
                {isEntryFromToday(viewingEntry.date) && (
                  <>
                    <button 
                      className="diary-modal-action-btn edit" 
                      onClick={(e) => handleStartEdit(viewingEntry, e)}
                    >
                      Rewrite Entry <Edit3 size={16} />
                    </button>
                    <button 
                      className="diary-modal-action-btn delete" 
                      onClick={() => handleDeleteEntry(viewingEntry.id)}
                    >
                      Delete Entry <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button className="diary-modal-action-btn close" onClick={() => setViewingEntry(null)}>
                  Close
                </button>
              </div>
            </GlowCard>
          </div>
        </div>
      )}

      {/* Rewrite Present Day Entry Modal */}
      {editingEntry && (
        <div className="modal-overlay" onClick={() => setEditingEntry(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '550px' }}>
            <GlowCard className="diary-entry-modal-card">
              <div className="diary-entry-modal-header">
                <span className="diary-entry-modal-date">{editingEntry.date} (Today)</span>
                <button className="diary-modal-close-btn" onClick={() => setEditingEntry(null)}>✕</button>
              </div>
              <h3 className="diary-entry-modal-title">Rewrite Present Day's Entry</h3>
              <textarea 
                className="diary-textarea-large edit-textarea" 
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={7}
                placeholder="Rewrite your thoughts..."
              ></textarea>
              <div className="modal-actions-row">
                <button className="diary-modal-action-btn close" onClick={() => setEditingEntry(null)}>
                  Cancel
                </button>
                <button className="diary-modal-action-btn edit" onClick={handleSaveRewrite}>
                  Save Rewrite
                </button>
              </div>
            </GlowCard>
          </div>
        </div>
      )}

    </div>
  );
};

export default Diary;
