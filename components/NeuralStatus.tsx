
import React, { useState, useEffect } from 'react';
import { Zap, Activity, Wifi, Brain } from 'lucide-react';
import { aiService } from '../services/ai';

const STATIC_THOUGHTS = [
  "Kullanıcı etkileşim örüntüleri analiz ediliyor...",
  "Neural Workspace optimizasyonu tamamlandı.",
  "Otonom ajanlar standby modunda bekliyor.",
  "Yeni bir makro kısayol tespit edildi.",
  "Bilişsel matris senkronize ediliyor..."
];

const NeuralStatus: React.FC<{ profile: any, knowledgeBase: any[] }> = ({ profile, knowledgeBase }) => {
  const [thought, setThought] = useState(STATIC_THOUGHTS[0]);
  const [isDreaming, setIsDreaming] = useState(false);
  const [opacity, setOpacity] = useState(1);

  const fetchDynamicThought = async () => {
    setOpacity(0);
    setTimeout(async () => {
      try {
        setIsDreaming(true);
        const dynamicThought = await aiService.generateDream(profile, knowledgeBase);
        setThought(dynamicThought);
      } catch (e) {
        setThought(STATIC_THOUGHTS[Math.floor(Math.random() * STATIC_THOUGHTS.length)]);
      } finally {
        setIsDreaming(false);
        setOpacity(1);
      }
    }, 500);
  };

  useEffect(() => {
    const interval = setInterval(fetchDynamicThought, 12000);
    return () => clearInterval(interval);
  }, [profile, knowledgeBase]);

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-black/40 backdrop-blur-md border-b border-white/5 z-[200000] flex items-center px-10 gap-8 pointer-events-none">
       <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isDreaming ? 'bg-purple-500 animate-ping' : 'bg-cyan-500 animate-pulse'}`} />
          <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.3em]">
            {isDreaming ? 'Neural Dreaming' : 'Neural Live Feed'}
          </span>
       </div>
       <div className="h-3 w-px bg-white/10" />
       <div 
         className="flex-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest transition-all duration-500 flex items-center gap-4 truncate"
         style={{ opacity }}
       >
          <Brain className={`w-3 h-3 ${isDreaming ? 'text-purple-400' : 'text-cyan-500/40'}`} />
          {thought}
       </div>
       <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <Activity className="w-3 h-3 text-emerald-500" />
             <span className="text-[7px] font-black text-slate-500 uppercase">Sync: 100%</span>
          </div>
          <div className="flex items-center gap-2">
             <Wifi className="w-3 h-3 text-cyan-500" />
             <span className="text-[7px] font-black text-slate-500 uppercase">Mesh: Connected</span>
          </div>
       </div>
    </div>
  );
};

export default NeuralStatus;
