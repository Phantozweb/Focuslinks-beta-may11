'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

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

function getInitialPath(): string {
  if (typeof window !== 'undefined') {
    return window.location.hash.replace('#', '') || '/';
  }
  return '/';
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState(getInitialPath);
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
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
    '*': segments.slice(1).join('/')
  };
}

export function Link({ to, children, className, onClick, ...props }: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any;
}) {
  const { navigate } = useContext(NavigationContext);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  return (
    <a href={`#${to}`} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
