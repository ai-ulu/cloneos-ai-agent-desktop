
import { useState, useCallback, useEffect } from 'react';
import { WindowState } from '../types';
import { INITIAL_WINDOWS } from '../constants';

export const useWindows = () => {
  const [windows, setWindows] = useState<WindowState[]>(() => {
    const saved = localStorage.getItem('clone_os_windows');
    return saved ? JSON.parse(saved) : INITIAL_WINDOWS.map(w => ({ 
      ...w, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10 
    }));
  });
  const [maxZIndex, setMaxZIndex] = useState(100);

  useEffect(() => {
    localStorage.setItem('clone_os_windows', JSON.stringify(windows));
  }, [windows]);

  const openWindow = useCallback((id: string) => {
    setWindows(prev => {
      const newZ = maxZIndex + 1;
      setMaxZIndex(newZ);
      return prev.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: newZ } : w);
    });
  }, [maxZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false, isMaximized: false } : w));
  }, []);

  const focusWindow = useCallback((id: string) => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: newZ } : w));
  }, [maxZIndex]);

  const toggleMaximize = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  }, []);

  const orchestrate = useCallback(() => {
    setWindows(prev => {
      const openWins = prev.filter(w => w.isOpen && !w.isMinimized);
      if (openWins.length === 0) return prev;
      
      return prev.map(w => {
        if (!w.isOpen || w.isMinimized) return w;
        // Reset maximization for orchestration
        return { ...w, isMaximized: false };
      });
    });
  }, []);

  return { windows, openWindow, closeWindow, focusWindow, toggleMaximize, minimizeWindow, orchestrate };
};
