
import React from 'react';
import { Network, Camera, Loader2, Workflow } from 'lucide-react';

interface LogEntry {
  msg: string;
  type: string;
}

interface SidebarProps {
  goal: string;
  setGoal: (val: string) => void;
  logs: LogEntry[];
  isProcessing: boolean;
  isAnalyzingImage: boolean;
  onStart: () => void;
  onImageAnalysis: (e: React.ChangeEvent<HTMLInputElement>) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  goal, setGoal, logs, isProcessing, isAnalyzingImage, onStart, onImageAnalysis, scrollRef, fileInputRef 
}) => {
  return (
    <div className="w-80 border-r border-white/5 bg-black/60 flex flex-col shrink-0">
      <div className="p-5 border-b border-white/5 bg-zinc-950/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span className="font-black uppercase tracking-widest text-white">Mesh Network</span>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {logs.map((log, i) => (
          <div key={i} className={`p-4 rounded-[20px] border transition-all animate-in slide-in-from-left-2 ${
            log.type === 'thought' ? 'bg-purple-500/10 border-purple-500/20 text-purple-200' :
            log.type === 'spawn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
            log.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
            log.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
            'bg-white/5 border-white/5 text-slate-400'
          }`}>
            <div className="text-[7px] font-black uppercase opacity-40 mb-1">{log.type}</div>
            {log.msg}
          </div>
        ))}
      </div>

      <div className="p-6 bg-zinc-950/90 border-t border-white/5 space-y-4">
        <div className="relative">
          <textarea 
            value={goal} onChange={e => setGoal(e.target.value)}
            placeholder="Görev emrini otonom ağa gönder..."
            className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs text-white focus:border-cyan-500/50 outline-none resize-none h-28 mb-0"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={onImageAnalysis} className="hidden" accept="image/*" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-cyan-400">
              {isAnalyzingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button 
          onClick={onStart} disabled={isProcessing || !goal.trim()}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white p-4 rounded-2xl font-black uppercase transition-all flex items-center justify-center gap-2 shadow-2xl shadow-cyan-900/40"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Workflow className="w-4 h-4" />} Ajanları Başlat
        </button>
      </div>
    </div>
  );
};
