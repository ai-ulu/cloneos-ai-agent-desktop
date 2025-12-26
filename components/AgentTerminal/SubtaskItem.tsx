
import React, { useState } from 'react';
import { Search, Code, ShieldCheck, Layers, Zap, Loader2, Check, Bug, ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, History, FastForward, Activity, ChevronRight, Share2, ClipboardCheck, Command, Send, Sparkles, MessageSquareQuote, Quote } from 'lucide-react';
import { SubTask, SubAgent } from '../../types';

const AGENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  researcher: <Search className="w-3.5 h-3.5" />,
  coder: <Code className="w-3.5 h-3.5" />,
  debugger: <ShieldCheck className="w-3.5 h-3.5" />,
  architect: <Layers className="w-3.5 h-3.5" />,
  analyst: <Zap className="w-3.5 h-3.5" />
};

interface SubtaskItemProps {
  task: SubTask;
  index: number;
  agent?: SubAgent;
  isPushed: boolean;
  onPushCode: (taskId: string, title: string, content: string) => void;
  onIntervene?: (taskId: string, command: string) => void;
  onRefine?: (taskId: string) => void;
  isRefining?: boolean;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({ 
  task, index, agent, isPushed, onPushCode, onIntervene, onRefine, isRefining 
}) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showIntervention, setShowIntervention] = useState(false);
  const [showFeedbackHistory, setShowFeedbackHistory] = useState(false);
  const [interventionCmd, setInterventionCmd] = useState('');

  const handleSendIntervention = () => {
    if (interventionCmd.trim() && onIntervene) {
      onIntervene(task.id, interventionCmd);
      setInterventionCmd('');
      setShowIntervention(false);
    }
  };

  const hasFeedback = task.feedbackLoop && task.feedbackLoop.length > 0;

  return (
    <div className={`p-10 rounded-[56px] border transition-all duration-700 relative overflow-hidden group ${
      task.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20' :
      task.status === 'running' || task.status === 'debugging' || task.status === 'retrying' ? 'bg-cyan-500/10 border-cyan-500/40 shadow-2xl' : 
      task.status === 'failed' ? 'bg-rose-500/10 border-rose-500/30' :
      'bg-white/5 border-white/5 opacity-50'
    }`}>
      {(task.status === 'running' || task.status === 'debugging' || task.status === 'retrying') && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-8">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-xl font-black transition-all duration-700 ${
            task.status === 'completed' ? 'bg-emerald-500 text-white scale-110 shadow-[0_0_40px_#10b98140]' : 
            task.status === 'debugging' || task.status === 'retrying' ? 'bg-amber-500 text-white animate-pulse' :
            'bg-zinc-900 text-slate-700 border border-white/5'
          }`}>{index + 1}</div>
          <div>
            <h5 className="text-2xl font-black text-white tracking-tighter flex items-center gap-4">
              {task.title}
              {task.status === 'debugging' && <Bug className="w-5 h-5 text-amber-500 animate-bounce" />}
              {task.status === 'retrying' && <History className="w-5 h-5 text-cyan-500 animate-spin" />}
              {task.status === 'completed' && <Check className="w-5 h-5 text-emerald-500" />}
            </h5>
            <div className="flex items-center gap-3 mt-2">
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{task.description}</p>
               {hasFeedback && (
                 <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[8px] font-black uppercase rounded-full border border-purple-500/20">
                   {task.feedbackLoop!.length} Cycles
                 </span>
               )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {agent && (
            <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-3xl border border-white/10 group-hover:border-cyan-500/40 transition-all">
              {AGENT_TYPE_ICONS[agent.specialization]}
              <span className="text-[11px] font-black uppercase text-white tracking-widest">{agent.name}</span>
            </div>
          )}
          
          <div className="flex gap-2">
            {hasFeedback && (
              <button 
                onClick={() => setShowFeedbackHistory(!showFeedbackHistory)}
                className={`p-4 rounded-2xl transition-all border ${showFeedbackHistory ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-white/5 text-slate-500 border-white/5 hover:text-white'}`}
                title="Döngü Geçmişi"
              >
                <History className="w-5 h-5" />
              </button>
            )}
            {task.status !== 'completed' && task.status !== 'pending' && (
               <button 
                  onClick={() => setShowIntervention(!showIntervention)}
                  className={`p-4 rounded-2xl transition-all border ${showIntervention ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-slate-500 border-white/5 hover:text-white'}`}
                  title="Manuel Müdahale"
               >
                 <Command className="w-5 h-5" />
               </button>
            )}
            <button 
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-slate-500 hover:text-white transition-all border border-white/5"
            >
              {showDiagnostics ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {showFeedbackHistory && hasFeedback && (
        <div className="mb-8 p-8 bg-purple-500/5 border border-purple-500/10 rounded-[40px] animate-in slide-in-from-top-4 duration-500 relative z-10 space-y-6">
           <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Neural Feedback Timeline</span>
           </div>
           <div className="space-y-6 relative ml-4">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-purple-500/10" />
              {task.feedbackLoop!.map((fb, idx) => (
                <div key={idx} className="relative pl-8 space-y-3">
                   <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-purple-500" />
                   <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-slate-500 uppercase">Cycle #{fb.attempt} • {fb.type}</span>
                      <span className="text-[7px] text-slate-700 uppercase font-bold">{fb.timestamp.toLocaleTimeString()}</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            <span className="text-[8px] font-black text-rose-500/60 uppercase">Critique</span>
                         </div>
                         <p className="text-[11px] text-slate-400 leading-relaxed italic">"{fb.critique}"</p>
                      </div>
                      <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                         <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span className="text-[8px] font-black text-emerald-500/60 uppercase">Neural Insight</span>
                         </div>
                         <p className="text-[11px] text-slate-300 leading-relaxed font-medium">"{fb.suggestion}"</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {showIntervention && (
        <div className="mb-8 p-8 bg-amber-500/5 border border-amber-500/20 rounded-[40px] animate-in slide-in-from-top-4 duration-500 relative z-10 space-y-6">
           <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Neural Override Active</span>
           </div>
           <div className="relative">
              <textarea 
                value={interventionCmd}
                onChange={(e) => setInterventionCmd(e.target.value)}
                placeholder="Ajan'a doğrudan talimat ver... (örn: 'Bu fonksiyonu async olarak yeniden yaz')"
                className="w-full bg-black border border-white/10 rounded-2xl p-6 text-xs text-white outline-none focus:border-amber-500/50 transition-all resize-none h-24"
              />
              <button 
                onClick={handleSendIntervention}
                disabled={!interventionCmd.trim()}
                className="absolute bottom-4 right-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-white p-3 rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
           </div>
           <p className="text-[9px] text-slate-500 font-medium italic">Müdahale komutu, otonom akışı durdurur ve ajanı verdiğiniz direktife göre yeniden hizalar.</p>
        </div>
      )}
      
      {showDiagnostics && (
        <div className="mb-8 p-10 bg-black/60 border border-white/5 rounded-[40px] space-y-10 animate-in slide-in-from-top-4 duration-500 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3">
                <Activity className="w-4 h-4 text-cyan-500" /> Memory Pressure
              </span>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${task.diagnostics?.memoryLoad || 15}%` }} />
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3">
                <History className="w-4 h-4 text-purple-500" /> Accuracy Rate
              </span>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${task.diagnostics?.confidence || 90}%` }} />
              </div>
            </div>
            <div className="space-y-4">
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Process Stream</span>
               <div className="flex gap-2">
                  {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} className="w-2 h-4 rounded-full bg-cyan-500/20 animate-pulse" style={{animationDelay: `${i*0.2}s`}} />
                  ))}
               </div>
            </div>
          </div>

          <div className="space-y-6">
             <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Log Stream</h6>
             <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-3 font-mono">
                {(task.diagnostics?.lastLogs || ["Sinaptik bağlantı kuruldu.", "Veri blokları taranıyor..."]).map((log, lIdx) => (
                  <div key={lIdx} className="text-[11px] text-slate-400 flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    {log}
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {task.result && (
        <div className="space-y-8 relative z-10 animate-in fade-in duration-1000">
          <div className="bg-black/80 p-10 rounded-[40px] border border-white/10 text-sm leading-relaxed text-slate-200 font-mono whitespace-pre-wrap relative group/code shadow-2xl">
            <div className="absolute top-6 right-6 opacity-20 group-hover/code:opacity-100 transition-opacity flex gap-4">
               <ClipboardCheck className="w-5 h-5 text-emerald-400 cursor-pointer" />
               <Share2 className="w-5 h-5 text-cyan-500 cursor-pointer" />
            </div>
            {task.result}
          </div>
          <div className="flex justify-end gap-6">
            <button 
              onClick={() => onRefine?.(task.id)}
              disabled={isRefining || task.status !== 'completed'}
              className="px-8 py-5 rounded-[28px] text-xs font-black uppercase transition-all flex items-center gap-4 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 disabled:opacity-30"
            >
               {isRefining ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
               %100 Optimizasyon
            </button>
            <button 
              onClick={() => onPushCode(task.id, task.title, task.result!)} 
              className={`px-10 py-5 rounded-[28px] text-xs font-black uppercase transition-all flex items-center gap-4 ${
                isPushed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-2xl shadow-cyan-900/40'
              }`}
            >
              {isPushed ? <><Check className="w-5 h-5" /> Workspace Senkronize Edildi</> : <><FastForward className="w-5 h-5" /> Workspace'e Gönder</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
