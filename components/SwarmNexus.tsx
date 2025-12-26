
import React, { useState, useEffect, useRef } from 'react';
import { 
  Share, Zap, Brain, TrendingUp, Search, Code, ShieldCheck, 
  MessageCircle, Loader2, Sparkles, RefreshCw, Layers, Radio,
  Command, ChevronRight, Play, CheckCircle2, AlertCircle
} from 'lucide-react';
import { aiService } from '../services/ai';
import { AgentTask, NeuralPattern, Notification } from '../types';

interface SwarmNexusProps {
  activeTask: AgentTask | null;
  patterns: NeuralPattern[];
  onTriggerPattern: (pattern: NeuralPattern) => void;
  onNotify: (title: string, message: string, type: Notification['type']) => void;
}

const SwarmNexus: React.FC<SwarmNexusProps> = ({ activeTask, patterns, onTriggerPattern, onNotify }) => {
  const [activeTab, setActiveTab] = useState<'mesh' | 'learning'>('mesh');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Simulated node positions for the mesh
  const nodes = activeTask?.agents.map((a, i) => ({
    id: a.id,
    name: a.name,
    type: a.specialization,
    x: 20 + Math.random() * 60,
    y: 20 + Math.random() * 60,
    status: a.status
  })) || [];

  const runNeuralSync = async () => {
    setIsAnalyzing(true);
    onNotify('Neural Sync', 'Sürü zekası örüntüleri analiz ediliyor...', 'learning');
    await new Promise(r => setTimeout(r, 2000));
    setIsAnalyzing(false);
    onNotify('Analiz Tamamlandı', 'Yeni otonom kısayollar tespit edildi.', 'success');
  };

  return (
    <div className="h-full flex flex-col bg-[#050508] overflow-hidden">
      {/* Nexus Header */}
      <div className="px-10 py-6 border-b border-white/5 bg-zinc-950/60 backdrop-blur-3xl flex items-center justify-between">
         <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('mesh')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mesh' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-500 hover:text-white'}`}
            >
              Swarm Mesh
            </button>
            <button 
              onClick={() => setActiveTab('learning')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'learning' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-500 hover:text-white'}`}
            >
              Neural Learning
            </button>
         </div>
         <button onClick={runNeuralSync} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
            <RefreshCw className={`w-5 h-5 text-slate-500 group-hover:text-cyan-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
         </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'mesh' ? (
          <div className="h-full p-10 flex flex-col gap-10">
            {/* 2D Neural Mesh Visualization */}
            <div className="flex-1 bg-black/40 border border-white/5 rounded-[48px] relative overflow-hidden group shadow-2xl">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#06b6d410_0%,_transparent_70%)]" />
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
               
               {/* Visualization Nodes */}
               <div className="absolute inset-0">
                  {nodes.map((node, i) => (
                    <div 
                      key={node.id}
                      className="absolute animate-in zoom-in duration-1000"
                      style={{ left: `${node.x}%`, top: `${node.y}%`, transition: 'all 2s ease-in-out' }}
                    >
                       <div className="relative group">
                          <div className={`w-20 h-20 rounded-3xl border-2 flex items-center justify-center backdrop-blur-3xl transition-all duration-500 ${
                            node.status === 'working' ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_#06b6d4]' : 
                            node.status === 'done' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_#10b981]' : 
                            'border-white/10 bg-white/5'
                          }`}>
                             <div className="text-white">
                                {node.type === 'researcher' && <Search className="w-8 h-8" />}
                                {node.type === 'coder' && <Code className="w-8 h-8" />}
                                {node.type === 'debugger' && <ShieldCheck className="w-8 h-8" />}
                                {node.type === 'architect' && <Layers className="w-8 h-8" />}
                                {node.type === 'analyst' && <Zap className="w-8 h-8" />}
                             </div>
                             {node.status === 'working' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full animate-ping" />}
                          </div>
                          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                             <div className="text-[10px] font-black text-white uppercase tracking-tighter">{node.name}</div>
                             <div className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{node.type} • {node.status}</div>
                          </div>
                       </div>
                    </div>
                  ))}

                  {/* Connecting Neural Lines (SVG) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                     {nodes.length > 1 && nodes.map((n, i) => i < nodes.length - 1 && (
                        <line 
                          key={i} 
                          x1={`${n.x}%`} y1={`${n.y}%`} 
                          x2={`${nodes[i+1].x}%`} y2={`${nodes[i+1].y}%`} 
                          stroke="url(#grad1)" strokeWidth="1" 
                          className="animate-pulse"
                        />
                     ))}
                     <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" style={{stopColor:'#06b6d4', stopOpacity:1}} />
                           <stop offset="100%" style={{stopColor:'#a855f7', stopOpacity:1}} />
                        </linearGradient>
                     </defs>
                  </svg>
               </div>

               <div className="absolute bottom-8 left-10 flex gap-4">
                  <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                     <span className="text-[9px] font-black uppercase text-white tracking-widest">Mesh Network: ACTIVE</span>
                  </div>
               </div>
            </div>

            {/* Task Log Summary */}
            <div className="bg-zinc-900/20 border border-white/5 rounded-[40px] p-8 flex flex-col gap-6">
               <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Son Sürü İletişimi</h4>
               </div>
               <div className="space-y-4">
                  {activeTask?.sharedInsights.slice(-3).map((insight, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                       <Radio className="w-3.5 h-3.5 text-cyan-500 mt-0.5 animate-pulse" />
                       <p className="text-[11px] text-slate-400 leading-relaxed italic">"{insight}"</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full p-10 flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
             <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-[48px] p-12 flex flex-col gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Brain className="w-64 h-64 text-purple-400" /></div>
                
                <div className="flex flex-col gap-2">
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Autonomous Patterns</h3>
                   <p className="text-slate-500 text-sm max-w-xl leading-relaxed">CloneOS kullanım alışkanlıklarını analiz ederek iş yükünü hafifleten otonom kısayollar ve makrolar üretir.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {patterns.length === 0 ? (
                     <div className="col-span-2 py-20 flex flex-col items-center justify-center opacity-20 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest">Örüntü aranıyor...</span>
                     </div>
                   ) : patterns.map((p, i) => (
                     <div key={i} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[40px] group hover:border-purple-500/40 transition-all flex flex-col gap-6 shadow-2xl">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3 text-purple-400">
                              <Sparkles className="w-5 h-5" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Pattern Detected</span>
                           </div>
                           <div className="text-[9px] font-black text-slate-600 bg-white/5 px-3 py-1 rounded-full">{Math.round(p.confidence * 100)}% Match</div>
                        </div>
                        
                        <div className="space-y-4 flex-1">
                           <div className="flex items-center gap-3">
                              <Command className="w-4 h-4 text-slate-500" />
                              <p className="text-base text-white font-bold tracking-tight">"{p.trigger}"</p>
                           </div>
                           <ChevronRight className="w-5 h-5 text-slate-700 ml-4" />
                           <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                              <Play className="w-4 h-4 text-cyan-400" />
                              <p className="text-[11px] text-slate-300 font-medium">{p.action}</p>
                           </div>
                        </div>

                        <button 
                          onClick={() => onTriggerPattern(p)}
                          className="w-full bg-purple-600 hover:bg-purple-500 text-white p-5 rounded-[24px] font-black text-[10px] uppercase shadow-xl shadow-purple-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                           Neural Kısayolu Aktifleştir <Play className="w-3.5 h-3.5" />
                        </button>
                     </div>
                   ))}
                </div>
             </div>

             {/* Learning Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Analiz Edilen İşlem', val: '2,481', icon: <TrendingUp className="w-4 h-4" />, col: 'text-cyan-400' },
                  { label: 'Doğruluk Oranı', val: '98.2%', icon: <CheckCircle2 className="w-4 h-4" />, col: 'text-emerald-400' },
                  { label: 'Risk Tahmini', val: 'Low', icon: <AlertCircle className="w-4 h-4" />, col: 'text-rose-400' }
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-900/20 border border-white/5 p-8 rounded-[40px] flex items-center justify-between">
                     <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{stat.label}</span>
                        <div className="text-2xl font-black text-white">{stat.val}</div>
                     </div>
                     <div className={`p-4 bg-white/5 rounded-2xl ${stat.col}`}>{stat.icon}</div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwarmNexus;
