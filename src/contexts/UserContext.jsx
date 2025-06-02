// src/contexts/UserContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const UserContext = createContext({
  userData: null,
  loading: true,
  updateUserData: async (updates) => {},
});

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unsubscribeSnapshot, setUnsubscribeSnapshot] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Detach any existing Firestore listener
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        setUnsubscribeSnapshot(null);
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubSnapshot = onSnapshot(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setUserData({ uid: user.uid, ...snapshot.data() });
            } else {
              setUserData({ uid: user.uid });
            }
            setLoading(false);
          },
          (error) => {
            console.error('User snapshot error:', error);
            setLoading(false);
          }
        );
        setUnsubscribeSnapshot(() => unsubSnapshot);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
    // Note: No dependencies array entries—only run once on mount
  }, []);

  const updateUserData = useCallback(
    async (updates) => {
      if (!userData || !userData.uid) return;
      // 1) Optimistic merge into local state
      setUserData((prev) => {
        if (!prev) return prev;
        const merged = { ...prev };
        Object.entries(updates).forEach(([path, value]) => {
          const parts = path.split('.');
          if (parts.length === 1) {
            merged[path] = value;
          } else {
            let target = merged;
            for (let i = 0; i < parts.length - 1; i++) {
              const key = parts[i];
              if (target[key] == null || typeof target[key] !== 'object') {
                target[key] = {};
              }
              target = target[key];
            }
            target[parts[parts.length - 1]] = value;
          }
        });
        return merged;
      });

      // 2) Firestore write
      try {
        const userRef = doc(db, 'users', userData.uid);
        await updateDoc(userRef, updates);
      } catch (err) {
        console.error('Failed Firestore update:', err);
      }
    },
    [userData]
  );

  return (
    <UserContext.Provider
      value={{
        userData,
        loading,
        updateUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
