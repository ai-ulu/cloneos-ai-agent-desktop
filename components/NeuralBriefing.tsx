
import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Activity, Brain, ChevronRight, Play, X, Bot, ShieldCheck } from 'lucide-react';
import { aiService } from '../services/ai';

interface NeuralBriefingProps {
  onClose: () => void;
  profile: any;
  systemStatus: any;
}

const NeuralBriefing: React.FC<NeuralBriefingProps> = ({ onClose, profile, systemStatus }) => {
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBriefing = async () => {
      const result = await aiService.getClient().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Kullanıcı: ${profile.name}. Sistem Durumu: ${JSON.stringify(systemStatus)}. 
        Bugün için kısa, etkileyici ve otonom bir sistem özeti hazırla. 
        3 ana madde: 'Neural Progress', 'Detected Patterns', 'Today's Strategy'. 
        Dil: Türkçe. Format: JSON.`,
        config: { responseMimeType: 'application/json' }
      });
      setBriefing(JSON.parse(result.text || "{}"));
      setLoading(false);
    };
    fetchBriefing();
  }, []);

  return (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-4xl bg-[#0a0a0c] border border-cyan-500/20 rounded-[60px] overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.15)] flex flex-col md:flex-row relative">
        <div className="absolute top-8 right-8">
           <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
              <X className="w-6 h-6" />
           </button>
        </div>

        {/* Brand Side */}
        <div className="w-full md:w-2/5 p-12 bg-gradient-to-b from-cyan-500/10 to-transparent flex flex-col justify-between border-r border-white/5">
           <div className="space-y-6">
              <div className="w-20 h-20 bg-cyan-500/20 rounded-[30px] flex items-center justify-center border border-cyan-500/30">
                 <Bot className="w-10 h-10 text-cyan-400" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Neural<br/>Briefing</h2>
                 <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em]">System Status: OPTIMAL</p>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-500">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Self-Evolution: ACTIVE</span>
              </div>
              <div className="text-[10px] text-slate-600 leading-relaxed font-bold uppercase tracking-widest">
                 Last Checkpoint: {new Date().toLocaleTimeString()}
              </div>
           </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 p-16 overflow-y-auto custom-scrollbar">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-6">
                <div className="relative">
                   <div className="w-16 h-16 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                   <Brain className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Neural Data Syncing...</p>
             </div>
           ) : (
             <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
                <section className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Neural Progress</h3>
                   </div>
                   <p className="text-xl text-slate-200 font-medium leading-relaxed italic">"{briefing.progress || briefing['Neural Progress']}"</p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-4 group hover:border-cyan-500/30 transition-all">
                      <Terminal className="w-5 h-5 text-purple-400" />
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Detected Patterns</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{briefing.patterns || briefing['Detected Patterns']}</p>
                   </div>
                   <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-4 group hover:border-emerald-500/30 transition-all">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Today's Strategy</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{briefing.strategy || briefing["Today's Strategy"]}</p>
                   </div>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white p-6 rounded-[30px] font-black text-xs uppercase shadow-2xl shadow-cyan-900/40 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                >
                   CloneOS Komuta Merkezine Geç <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default NeuralBriefing;
