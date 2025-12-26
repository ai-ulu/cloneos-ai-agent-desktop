
import React, { useState } from 'react';
import { UserCheck, Upload, FileText, Sparkles, Loader2, ArrowRight, ShieldCheck, Target, MessageCircle } from 'lucide-react';
import { aiService } from '../services/ai';
import { CloneProfile } from '../types';

interface InterviewProProps {
  profile: CloneProfile;
}

const InterviewPro: React.FC<InterviewProProps> = ({ profile }) => {
  const [topic, setTopic] = useState('');
  const [jd, setJd] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [briefing, setBriefing] = useState<any>(null);

  const startPreparation = async () => {
    if (!topic.trim() || !jd.trim()) return;
    setIsPreparing(true);
    const result = await aiService.generateInterviewBriefing(topic, jd, profile);
    setBriefing(result);
    setIsPreparing(false);
  };

  return (
    <div className="h-full bg-[#050508] text-slate-300 p-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-purple-500/10 rounded-[28px] flex items-center justify-center border border-purple-500/20 shadow-2xl">
                 <UserCheck className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Interview Preparation Pro</h2>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Neural Coaching & Strategy Engine</p>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">Advanced Simulation Ready</span>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Inputs */}
           <div className="space-y-8">
              <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[48px] space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                       <Target className="w-4 h-4 text-cyan-500" /> Toplantı / Mülakat Konusu
                    </label>
                    <input 
                      value={topic} onChange={e => setTopic(e.target.value)}
                      placeholder="Örn: Senior Frontend Developer Görüşmesi"
                      className="w-full bg-black border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-cyan-500/40 transition-all"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                       <FileText className="w-4 h-4 text-purple-500" /> İş İlanı veya Gündem
                    </label>
                    <textarea 
                      value={jd} onChange={e => setJd(e.target.value)}
                      rows={6}
                      placeholder="İş tanımını veya toplantı notlarını buraya yapıştırın..."
                      className="w-full bg-black border border-white/10 rounded-[32px] p-6 text-white outline-none focus:border-purple-500/40 transition-all resize-none"
                    />
                 </div>
                 <button 
                  onClick={startPreparation} disabled={isPreparing || !topic.trim() || !jd.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white p-6 rounded-[32px] font-black text-xs uppercase flex items-center justify-center gap-4 shadow-2xl shadow-purple-900/20 transition-all active:scale-95"
                 >
                    {isPreparing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Strateji Oluştur
                 </button>
              </div>

              <div className="p-8 bg-cyan-500/5 border border-cyan-500/10 rounded-[40px] flex items-start gap-6">
                 <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <MessageCircle className="w-5 h-5 text-cyan-400" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-xs font-black text-white uppercase">Neural Suflör Entegrasyonu</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Burada oluşturulan strateji, 'Sesli Asistan'daki mülakat moduna otomatik olarak aktarılır ve görüşme anında suflör olarak kullanılır.</p>
                 </div>
              </div>
           </div>

           {/* Results */}
           <div className="space-y-8">
              {briefing ? (
                 <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[56px] space-y-8">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em]">Potansiyel Sorular</h4>
                          <div className="space-y-3">
                             {briefing.potentialQuestions.map((q: string, i: number) => (
                               <div key={i} className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                                  <p className="text-xs text-slate-300 font-medium">{q}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                       
                       <div className="space-y-4 pt-6 border-t border-white/5">
                          <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Stratejik Hamle</h4>
                          <p className="text-sm text-slate-100 italic leading-relaxed bg-cyan-500/5 p-6 rounded-3xl border border-cyan-500/20">
                             "{briefing.strategy}"
                          </p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[32px] text-center">
                          <span className="text-[8px] font-black text-emerald-500 uppercase block mb-1">Hazırlık Seviyesi</span>
                          <span className="text-xl font-black text-white uppercase tracking-tighter">98% OPTIMAL</span>
                       </div>
                       <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[32px] text-center">
                          <span className="text-[8px] font-black text-amber-500 uppercase block mb-1">Görüşme Risk Faktörü</span>
                          <span className="text-xl font-black text-white uppercase tracking-tighter">DÜŞÜK</span>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 gap-8 grayscale py-20">
                    <Target className="w-32 h-32" />
                    <span className="text-xs font-black uppercase tracking-[0.8em]">Briefing Pending...</span>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPro;
