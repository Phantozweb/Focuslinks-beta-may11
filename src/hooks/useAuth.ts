'use client';
import { useState, useSyncExternalStore } from 'react';

interface FLUser {
  membershipId: string;
  name: string;
  email?: string;
  title?: string;
  role?: string;
  location?: string;
  image?: string;
  [key: string]: unknown;
}

const emptySubscribe = () => () => {};

function getStoredUserSnapshot(): FLUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('fl_user');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch { /* ignore */ }
  return null;
}

function getServerSnapshot(): FLUser | null {
  return null;
}

export function useAuth() {
  const user = useSyncExternalStore(emptySubscribe, getStoredUserSnapshot, getServerSnapshot);

  // On the server and first client render, user will be null (from getServerSnapshot).
  // After hydration, useSyncExternalStore will re-render with the real value from localStorage.
  const isLoggedIn = !!user;
  const isLoading = false; // useSyncExternalStore handles hydration

  const requireLogin = (action: string): boolean => {
    if (!isLoggedIn) {
      return false;
    }
    return true;
  };

  return { user, isLoggedIn, isLoading, requireLogin };
}
