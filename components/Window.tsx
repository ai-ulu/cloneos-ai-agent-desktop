
import React from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { AppTheme } from '../types';

interface WindowProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
  theme: AppTheme;
}

const Window: React.FC<WindowProps> = ({ 
  title, icon, zIndex, isMinimized, isMaximized, onClose, onMinimize, onMaximize, onFocus, children, theme
}) => {
  if (isMinimized) return null;

  const windowStyles = isMaximized 
    ? { top: 0, left: 0, width: '100%', height: '100%', zIndex }
    : { top: '6%', left: '8%', width: '84%', height: '82%', maxWidth: '1600px', zIndex };

  return (
    <div 
      onClick={onFocus}
      style={{ 
        ...windowStyles, 
        borderRadius: isMaximized ? '0px' : theme.borderRadius,
        fontFamily: theme.fontFamily
      }}
      className={`absolute ${theme.windowBg} ${theme.glassBlur} border border-white/10 flex flex-col shadow-[0_80px_160px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 ring-1 ring-white/10`}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-10 py-6 bg-white/[0.02] border-b border-white/5 cursor-default group shrink-0">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5" style={{ color: theme.accent }}>{icon}</div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 leading-none">{title}</span>
            <span className="text-[7px] font-bold uppercase tracking-widest" style={{ color: `${theme.accent}99` }}>Neural Instance Active</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }} 
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-2xl text-slate-500 transition-all active:scale-90"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(); }} 
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-2xl text-slate-500 transition-all active:scale-90"
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="w-10 h-10 flex items-center justify-center bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl transition-all shadow-xl active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

export default Window;
