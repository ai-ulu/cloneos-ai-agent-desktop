
import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Brain, Activity, ShieldCheck, Globe, Radio } from 'lucide-react';

const SystemCore: React.FC<{ isIdle?: boolean }> = ({ isIdle = true }) => {
  const [pulse, setPulse] = useState(0);
  const [metrics, setMetrics] = useState({
    synapseLoad: 12,
    decisionRate: 0.95,
    meshSync: 99.4
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 100);
      setMetrics({
        synapseLoad: isIdle ? 5 + Math.random() * 5 : 20 + Math.random() * 40,
        decisionRate: 0.90 + Math.random() * 0.09,
        meshSync: 99.0 + Math.random() * 0.9
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isIdle]);

  return (
    <div className="flex flex-col items-center gap-10 py-10">
       {/* Orbital Visualizer */}
       <div className="relative w-48 h-48">
          <div className={`absolute inset-0 blur-[100px] rounded-full animate-pulse transition-colors duration-[3000ms] ${isIdle ? 'bg-purple-500/10' : 'bg-cyan-500/10'}`} />
          <div className={`absolute inset-0 border border-white/5 rounded-full animate-spin duration-[40s] ${isIdle ? 'border-purple-500/20' : 'border-cyan-500/20'}`} />
          <div className="absolute inset-4 border border-white/5 rounded-full animate-spin duration-[25s] direction-reverse opacity-20" />
          
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="relative">
                <Brain className={`w-16 h-16 transition-all duration-1000 ${isIdle ? 'text-purple-400 opacity-40 scale-110' : 'text-cyan-400 opacity-20 scale-100'}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className={`w-2 h-2 rounded-full animate-ping ${isIdle ? 'bg-purple-400 shadow-[0_0_40px_#a855f7]' : 'bg-cyan-400 shadow-[0_0_40px_#22d3ee]'}`} />
                </div>
             </div>
          </div>
          
          {/* Floating Metric Nodes */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2">
             <Radio className={`w-3 h-3 ${isIdle ? 'text-purple-400' : 'text-cyan-400'} animate-pulse`} />
             <span className="text-[9px] font-black text-white uppercase tracking-widest">{isIdle ? 'Dream Mode' : 'Active Ops'}</span>
          </div>
       </div>

       {/* Horizontal Telemetry */}
       <div className="grid grid-cols-3 gap-6 w-full max-w-md">
          <div className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-cyan-500/30 transition-all">
             <Cpu className="w-4 h-4 text-cyan-500/40 group-hover:text-cyan-400" />
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Synapse</span>
             <span className="text-xs font-black text-white">{metrics.synapseLoad.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-emerald-500/30 transition-all">
             <ShieldCheck className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-400" />
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Integrity</span>
             <span className="text-xs font-black text-white">Safe</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-purple-500/30 transition-all">
             <Globe className="w-4 h-4 text-purple-500/40 group-hover:text-purple-400" />
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Mesh Sync</span>
             <span className="text-xs font-black text-white">{metrics.meshSync.toFixed(1)}%</span>
          </div>
       </div>
    </div>
  );
};

export default SystemCore;
