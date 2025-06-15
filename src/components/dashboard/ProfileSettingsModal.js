// src/components/dashboard/ProfileSettingsModal.js

import React, { useState, useContext, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import UserContext from '../../contexts/UserContext';
import styles from './ProfileSettingsModal.module.css';

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const { userData } = useContext(UserContext);
  const user = auth.currentUser;

  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setUsername(userData.username || '');
      setEmail(user.email || '');
      setPassword('');
      setConfirm('');
      setError('');
      setSuccess('');
    }
  }, [isOpen, user, userData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password && password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      // 1) Update displayName
      if (username !== userData.username) {
        await updateProfile(user, { displayName: username });
        await updateDoc(doc(db, 'users', user.uid), { username });
      }
      // 2) Update email
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      // 3) Update password
      if (password) {
        await updatePassword(user, password);
      }
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>Profile Settings</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <div className={styles.group}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className={styles.group}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          <div className={styles.group}>
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </div>

          <div className={styles.group}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat new password"
            />
          </div>

          <div className={styles.actions}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
