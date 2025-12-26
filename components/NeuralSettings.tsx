
import React, { useState } from 'react';
import { THEMES } from '../constants';
import { AppTheme } from '../types';
import { Settings, Shield, Zap, Database, Brain, RefreshCw, Sliders, Info, AlertCircle, Sparkles, Layout, CheckCircle2 } from 'lucide-react';

interface NeuralSettingsProps {
  activeTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

const NeuralSettings: React.FC<NeuralSettingsProps> = ({ activeTheme, onThemeChange }) => {
  const [ragStrength, setRagStrength] = useState(85);
  const [creativity, setCreativity] = useState(40);
  const [selfCorrection, setSelfCorrection] = useState(true);
  
  return (
    <div className="h-full bg-transparent text-slate-300 p-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="space-y-4">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-[28px] flex items-center justify-center border border-cyan-500/20 shadow-2xl">
                 <Brain className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Neural Engine Tuning</h2>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Advanced Behavioral & RAG Control</p>
              </div>
           </div>
        </header>

        {/* THEME STUDIO - NEW SECTION */}
        <section className="space-y-8">
           <div className="flex items-center gap-4">
              <Layout className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Visual Theme Studio</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {THEMES.map((theme) => (
                <button 
                  key={theme.id}
                  onClick={() => onThemeChange(theme)}
                  className={`p-8 rounded-[40px] border transition-all duration-500 text-left group relative overflow-hidden ${
                    activeTheme.id === theme.id ? 'border-cyan-500/50 bg-cyan-500/5 ring-1 ring-cyan-500/20' : 'border-white/5 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                  </div>
                  
                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center justify-between">
                       <h4 className="text-lg font-black text-white uppercase tracking-tighter">{theme.name}</h4>
                       {activeTheme.id === theme.id && <CheckCircle2 className="w-5 h-5 text-cyan-500" />}
                    </div>
                    
                    <div className="flex gap-2">
                       <div className="w-8 h-8 rounded-lg" style={{ background: theme.accent }} />
                       <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
                       <div className="flex-1 h-8 rounded-lg border border-white/5 overflow-hidden">
                          <div className="w-full h-full opacity-50" style={{ background: theme.background }} />
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                       <span>Rounded: {theme.borderRadius}</span>
                       <span>Font: {theme.fontFamily.split(',')[0]}</span>
                    </div>
                  </div>
                </button>
              ))}
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* RAG & Hallucination Control */}
           <div className="bg-zinc-900/40 border border-white/5 p-10 rounded-[56px] space-y-8">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Database className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">RAG Anchor Strength</h4>
                 </div>
                 <span className="text-xs font-black text-cyan-400">{ragStrength}%</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed uppercase font-bold tracking-tight">Klonun hafızadaki (Vault) gerçek verilere ne kadar sıkı bağlı kalacağını belirler. Yüksek değer halüsinasyonu önler.</p>
              <input 
                type="range" value={ragStrength} onChange={e => setRagStrength(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase">
                 <span>Flexible</span>
                 <span>Strict Reality</span>
              </div>
           </div>

           {/* Creativity / Fine-Tuning */}
           <div className="bg-zinc-900/40 border border-white/5 p-10 rounded-[56px] space-y-8">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Creativity Weight</h4>
                 </div>
                 <span className="text-xs font-black text-purple-400">{creativity}%</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed uppercase font-bold tracking-tight">Modelin otonom kararlarında ne kadar "özgün" (yaratıcı) olacağını belirler. Düşük değerler daha teknik ve net sonuçlar verir.</p>
              <input 
                type="range" value={creativity} onChange={e => setCreativity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase">
                 <span>Analytical</span>
                 <span>Creative</span>
              </div>
           </div>
        </div>

        {/* Global Protections */}
        <div className="bg-cyan-500/5 border border-cyan-500/20 p-10 rounded-[56px] space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Shield className="w-6 h-6 text-emerald-500" />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Autonomous Self-Correction</h4>
                    <p className="text-[10px] text-emerald-500/60 uppercase font-black mt-1">Anti-Hallucination Protocol Active</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelfCorrection(!selfCorrection)}
                className={`w-16 h-8 rounded-full transition-all relative ${selfCorrection ? 'bg-emerald-600' : 'bg-white/5'}`}
              >
                 <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${selfCorrection ? 'left-9' : 'left-1'}`} />
              </button>
           </div>
           <div className="p-6 bg-black/40 rounded-3xl border border-white/5 flex items-start gap-4">
              <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-1" />
              <p className="text-[11px] text-slate-500 leading-relaxed italic">Self-Correction açık olduğunda, klonun verdiği cevaplar Gemini tarafından gizli bir ikinci turda doğrulanır. Bu işlem latensi süresini hafifçe artırabilir ancak güvenilirliği maksimize eder.</p>
           </div>
        </div>

        <div className="pt-10 flex justify-center pb-12">
           <button className="flex items-center gap-4 bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-[32px] font-black text-xs uppercase border border-white/10 transition-all active:scale-95">
              <RefreshCw className="w-4 h-4" /> Neural Mesh Senkronizasyonu Yap
           </button>
        </div>
      </div>
    </div>
  );
};

export default NeuralSettings;
