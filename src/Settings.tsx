import { useState, FC } from 'react';
import { Menu, Trash2, AlertTriangle } from 'lucide-react';
import { signOut, updateProfile, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Sidebar from './Sidebar';
import GlowCard from './GlowCard';
import './Settings.css';
import { OnNavigateFn } from './types';

export interface SettingsProps {
  userName?: string;
  onNavigate: OnNavigateFn;
}

const Settings: FC<SettingsProps> = ({ userName, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(userName || 'Name');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const avatarLetter = (userName || 'Name').charAt(0).toUpperCase();

  const handleSave = async () => {
    setIsEditing(false);
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: inputValue });
      } catch (err) {
        console.error('Failed to update profile name:', err);
      }
    }
    onNavigate('settings', { name: inputValue });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
    onNavigate('signin');
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      // 1. Delete user document in Cloud Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);

      // 2. Delete user account in Firebase Auth
      await deleteUser(user);

      // 3. Clear local storage cache
      localStorage.clear();
      sessionStorage.clear();

      // 4. Navigate to signin page
      onNavigate('signin');
    } catch (err: any) {
      console.error('Account deletion error:', err);
      if (err.code === 'auth/requires-recent-login') {
        // If security requires recent login, clear Firestore data and sign out
        try {
          await deleteDoc(doc(db, 'users', user.uid));
          localStorage.clear();
          sessionStorage.clear();
          await signOut(auth);
          onNavigate('signin');
        } catch (subErr) {
          setDeleteError('Please sign in again before deleting your account for security reasons.');
        }
      } else {
        setDeleteError(err.message || 'Failed to delete account. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="dashboard-layout settings-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} onNavigate={onNavigate} active="settings" />
      
      <div className={`dashboard-main ${isSidebarOpen ? 'shifted' : ''}`}>
        
        {/* Top Bar */}
        <GlowCard className="topbar">
          <button className="topbar-toggle" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="topbar-title">Settings</h2>
        </GlowCard>

        {/* Settings Content */}
        <div className="settings-content-area">
          
          <div className="settings-avatar-circle">
            {avatarLetter}
          </div>

          <GlowCard className="settings-display-name-card">
            {isEditing ? (
              <div className="display-name-edit-mode">
                <span className="settings-label">Display Name</span>
                <input 
                  type="text" 
                  className="display-name-input" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                />
                <button className="settings-btn-primary full-width" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="display-name-read-mode">
                <div className="display-name-info">
                  <span className="settings-label">Display Name</span>
                  <span className="settings-value">{userName || 'Name'}</span>
                </div>
                <button className="settings-btn-primary" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              </div>
            )}
          </GlowCard>

          {/* Danger Zone / Delete Account Card */}
          <GlowCard className="settings-danger-card">
            <div className="danger-card-content">
              <div className="danger-card-info">
                <div className="danger-card-header">
                  <AlertTriangle size={20} className="danger-icon" />
                  <span className="danger-title">Danger Zone</span>
                </div>
                <p className="danger-desc">
                  Permanently delete your account and remove all habits, tasks, diary entries, and statistics.
                </p>
              </div>
              <button 
                className="delete-account-btn" 
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account <Trash2 size={16} />
              </button>
            </div>
          </GlowCard>

        </div>

        {/* Fixed Sign Out Button */}
        <div className="settings-footer">
          <button className="settings-btn-primary full-width signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>
            <GlowCard className="delete-account-modal-card">
              <div className="delete-modal-header">
                <div className="delete-modal-icon-badge">
                  <AlertTriangle size={24} color="#DC2626" />
                </div>
                <h3 className="delete-modal-title">Delete Account & Data?</h3>
              </div>
              
              <p className="delete-modal-desc">
                This will permanently delete your account and clear all habits, tasks, streaks, and diary entries from Cloud Firestore.
                When you log in again, you will start fresh with a clean new account.
              </p>

              {deleteError && <div className="auth-error">{deleteError}</div>}

              <div className="modal-actions-row" style={{ marginTop: '1.25rem' }}>
                <button 
                  className="diary-modal-action-btn close" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  className="diary-modal-action-btn delete" 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  style={{ background: '#DC2626', color: '#FFFFFF' }}
                >
                  {isDeleting ? 'Deleting Data...' : 'Yes, Delete Everything'}
                </button>
              </div>
            </GlowCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
