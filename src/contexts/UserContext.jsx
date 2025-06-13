// src/contexts/UserContext.js

import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const UserContext = createContext({
  userData: null,
  loading: true,
  updateUserData: async (updates) => {}
});

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const snapshotUnsubRef = useRef(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Tear down any existing Firestore listener
      if (snapshotUnsubRef.current) {
        snapshotUnsubRef.current();
        snapshotUnsubRef.current = null;
      }

      if (user) {
        setLoading(true);
        const userRef = doc(db, 'users', user.uid);
        // Subscribe to user document
        snapshotUnsubRef.current = onSnapshot(
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
      } else {
        // No user signed in
        setUserData(null);
        setLoading(false);
      }
    });

    // Cleanup on unmount
    return () => {
      unsubAuth();
      if (snapshotUnsubRef.current) {
        snapshotUnsubRef.current();
      }
    };
  }, []); // run once on mount

  const updateUserData = useCallback(
    async (updates) => {
      if (!userData?.uid) return;

      // 1) Optimistically update local state
      setUserData((prev) => {
        if (!prev) return prev;
        const merged = { ...prev };
        for (const [path, value] of Object.entries(updates)) {
          const parts = path.split('.');
          if (parts.length === 1) {
            merged[path] = value;
          } else {
            let target = merged;
            for (let i = 0; i < parts.length - 1; i++) {
              const key = parts[i];
              if (typeof target[key] !== 'object' || target[key] == null) {
                target[key] = {};
              }
              target = target[key];
            }
            target[parts.at(-1)] = value;
          }
        }
        return merged;
      });

      // 2) Persist to Firestore
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
      value={{ userData, loading, updateUserData }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
