'use client';

import React, { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react';
import { useSyncExternalStore } from 'react';

interface NavigationContextType {
  currentPath: string;
  navigate: (path: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentPath: '/',
  navigate: () => {},
  goBack: () => {},
});

// ── External browser-path store (useSyncExternalStore compatible) ──
const pathListeners = new Set<() => void>();

function emitChange() {
  pathListeners.forEach((l) => l());
}

function subscribe(callback: () => void): () => void {
  pathListeners.add(callback);
  const onPopState = () => emitChange();
  window.addEventListener('popstate', onPopState);
  return () => {
    pathListeners.delete(callback);
    window.removeEventListener('popstate', onPopState);
  };
}

function getSnapshot(): string {
  return window.location.pathname || '/';
}

function getServerSnapshot(): string {
  return '/';
}

// ── Hash-route migration (one-time) ──
let hashMigrated = false;

export function NavigationProvider({ children }: { children: ReactNode }) {
  const currentPath = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Migrate legacy hash routes once on mount
  useEffect(() => {
    if (hashMigrated) return;
    hashMigrated = true;
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== '/') {
      window.history.replaceState(null, '', hash);
      emitChange(); // notify store subscribers
    }
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, '', path);
    emitChange();
    window.scrollTo(0, 0);
  }, []);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPath, navigate, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigate() {
  return useContext(NavigationContext).navigate;
}

export function useLocation() {
  const ctx = useContext(NavigationContext);
  return { pathname: ctx.currentPath };
}

export function useParams() {
  const ctx = useContext(NavigationContext);
  const segments = ctx.currentPath.split('/').filter(Boolean);
  return {
    slug: segments[1] || '',
    id: segments[1] || '',
    '*': segments.slice(1).join('/'),
  };
}

export function Link({
  to,
  children,
  className,
  onClick,
  ...props
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: unknown;
}) {
  const { navigate } = useContext(NavigationContext);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  return (
    <a href={to} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
