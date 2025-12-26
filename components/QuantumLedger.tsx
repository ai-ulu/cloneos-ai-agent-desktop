
import React from 'react';
import { Database, Box, Clock, ChevronRight, Activity, Cpu } from 'lucide-react';
import { LedgerEntry } from '../types';

interface QuantumLedgerProps {
  entries: LedgerEntry[];
  onClose: () => void;
}

const QuantumLedger: React.FC<QuantumLedgerProps> = ({ entries, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-[#050508] font-mono text-[11px]">
      <div className="p-8 border-b border-white/5 bg-zinc-950/60 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
               <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Quantum Ledger</h3>
               <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Immutable System History • Secured by Neural Net</span>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
         {entries.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6 grayscale">
              <Box className="w-20 h-20" />
              <span className="text-xs font-black uppercase tracking-[0.5em]">No Ledger Blocks Detected</span>
           </div>
         ) : (
           entries.map((entry, i) => (
             <div key={entry.id} className="group flex gap-8 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex flex-col items-center">
                   <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                     entry.type === 'THOUGHT' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                     entry.type === 'ACTION' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                     'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                   }`}>
                      {entry.type === 'THOUGHT' ? <Cpu className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                   </div>
                   <div className="w-px flex-1 bg-white/5 my-2" />
                </div>
                
                <div className="flex-1 pb-8">
                   <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[28px] hover:border-white/10 transition-all group-hover:bg-white/[0.04]">
                      <div className="flex items-center justify-between mb-3">
                         <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Block #{entry.id.slice(0, 8)}</span>
                         <span className="text-[9px] font-bold text-slate-600 uppercase">{entry.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[12px]">{entry.content}</p>
                      {entry.metadata && (
                         <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                            {Object.entries(entry.metadata).map(([k, v]: [string, any]) => (
                               <div key={k}>
                                  <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">{k}</span>
                                  <span className="text-[10px] text-cyan-500 font-bold">{String(v)}</span>
                               </div>
                            ))}
                         </div>
                      )}
                   </div>
                </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};

export default QuantumLedger;
