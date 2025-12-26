
import React, { useState, useEffect } from 'react';
import { Github, GitCommit, Upload, CheckCircle2, RefreshCw, Database } from 'lucide-react';

interface GitHubSyncProps {
  lastChange: string;
}

const GitHubSync: React.FC<GitHubSyncProps> = ({ lastChange }) => {
  const [status, setStatus] = useState<'IDLE' | 'COMMITTING' | 'PUSHING' | 'SYNCED'>('IDLE');
  const [history, setHistory] = useState<{msg: string, time: string}[]>([]);

  useEffect(() => {
    if (lastChange) {
      handleSync();
    }
  }, [lastChange]);

  const handleSync = async () => {
    setStatus('COMMITTING');
    await new Promise(r => setTimeout(r, 800));
    setStatus('PUSHING');
    await new Promise(r => setTimeout(r, 1200));
    setStatus('SYNCED');
    
    const newEntry = {
      msg: lastChange.length > 30 ? lastChange.substring(0, 30) + "..." : lastChange,
      time: new Date().toLocaleTimeString()
    };
    
    setHistory(prev => [newEntry, ...prev].slice(0, 5));
    setTimeout(() => setStatus('IDLE'), 3000);
  };

  return (
    <div className="fixed bottom-24 right-14 w-80 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-2xl z-[10000] animate-in slide-in-from-right-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-white"><Github className="w-5 h-5" /></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Repository</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
          status === 'SYNCED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
        }`}>
          {status}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            {status === 'COMMITTING' ? <GitCommit className="w-4 h-4 text-amber-500 animate-spin" /> : 
             status === 'PUSHING' ? <Upload className="w-4 h-4 text-cyan-500 animate-bounce" /> :
             <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            <span className="text-[11px] text-slate-300 font-medium truncate">
              {status === 'IDLE' ? 'System Stable' : `Syncing: ${lastChange}`}
            </span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full bg-cyan-500 transition-all duration-[2000ms] ${status !== 'IDLE' ? 'w-full' : 'w-0'}`} />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Recent Commits</span>
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] bg-white/[0.02] p-2 rounded-xl border border-white/5">
              <span className="text-slate-400 truncate w-40 italic">"{h.msg}"</span>
              <span className="text-slate-600 font-mono">{h.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GitHubSync;
