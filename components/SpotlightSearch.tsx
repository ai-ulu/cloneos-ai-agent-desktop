
import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, Sparkles, Zap, FileCode, Database, MessageSquare, Terminal, X, Loader2, ArrowRight, Bot, Globe, ExternalLink } from 'lucide-react';
import { aiService } from '../services/ai';

interface SpotlightSearchProps {
  onClose: () => void;
  onAction: (action: any) => void;
}

const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ onClose, onAction }) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleExecute = async () => {
    if (!query.trim() || isProcessing) return;
    setIsProcessing(true);
    const commandResult = await aiService.executeCommand(query);
    setResult(commandResult);
    setIsProcessing(false);
    
    // If it's a direct app action, we can close and execute.
    // If it's a search result, we show it first.
    if (commandResult.action === 'OPEN_APP' || commandResult.action === 'CREATE_FILE') {
      setTimeout(() => {
        onAction(commandResult);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0a0c]/95 border border-white/10 rounded-[40px] shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300">
        <div className="flex items-center p-8 gap-6 border-b border-white/5">
          <Search className="w-8 h-8 text-cyan-500/50" />
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setResult(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            placeholder="Neural komut ver veya web'de ara..."
            className="flex-1 bg-transparent border-none outline-none text-2xl text-white placeholder:text-slate-700 font-medium"
          />
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
            <Command className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-black text-slate-500">ENTER</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-zinc-950/40">
           {isProcessing ? (
             <div className="p-20 flex flex-col items-center justify-center gap-6 animate-pulse">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                <div className="text-center space-y-2">
                   <p className="text-xs font-black uppercase tracking-[0.4em] text-white">Neural Engine Thinking</p>
                   <p className="text-[10px] text-slate-600 uppercase">Accessing Grounded Knowledge Systems...</p>
                </div>
             </div>
           ) : result ? (
             <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                         <Bot className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Neural Intelligence Report</span>
                   </div>
                </div>

                <div className="space-y-6">
                   <p className="text-lg text-slate-200 leading-relaxed font-medium">
                      {result.data || result.target}
                   </p>

                   {result.citations && result.citations.length > 0 && (
                      <div className="pt-6 border-t border-white/5 space-y-4">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" /> Web Kaynakları
                         </h4>
                         <div className="flex flex-wrap gap-2">
                            {result.citations.map((url: string, i: number) => (
                               <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] text-cyan-400 transition-all border border-white/5 group">
                                  {new URL(url).hostname} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                               </a>
                            ))}
                         </div>
                      </div>
                   )}
                </div>

                <div className="flex gap-4 pt-4">
                   <button onClick={() => { onAction(result); onClose(); }} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white p-5 rounded-[24px] font-black text-xs uppercase flex items-center justify-center gap-3 shadow-2xl shadow-cyan-900/40 transition-all active:scale-95">
                      Eylemi Onayla <ArrowRight className="w-4 h-4" />
                   </button>
                   <button onClick={() => setResult(null)} className="px-8 bg-white/5 hover:bg-white/10 text-slate-400 rounded-[24px] font-black text-xs uppercase transition-all">Sıfırla</button>
                </div>
             </div>
           ) : !query ? (
             <div className="grid grid-cols-2 gap-3 p-8">
                {[
                  { icon: <Terminal className="w-5 h-5" />, label: "Otonom Görev", cmd: "Yeni bir görev başlat", color: 'text-purple-400' },
                  { icon: <FileCode className="w-5 h-5" />, label: "Kod Analizi", cmd: "Dosyalarımı tarat", color: 'text-emerald-400' },
                  { icon: <Sparkles className="w-5 h-5" />, label: "Görsel Üretim", cmd: "Fütüristik bir manzara çiz", color: 'text-cyan-400' },
                  { icon: <Globe className="w-5 h-5" />, label: "Web Search", cmd: "Haberlerde ne var?", color: 'text-blue-400' }
                ].map((item, i) => (
                  <button key={i} onClick={() => setQuery(item.cmd)} className="flex items-center gap-6 p-6 bg-white/[0.02] hover:bg-white/[0.05] rounded-[32px] transition-all group text-left border border-white/5 hover:border-white/20">
                     <div className={`p-4 bg-white/5 rounded-2xl ${item.color} group-hover:scale-110 transition-transform shadow-xl`}>{item.icon}</div>
                     <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                        <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{item.cmd}</p>
                     </div>
                  </button>
                ))}
             </div>
           ) : (
             <div className="p-12 text-center space-y-4">
                <p className="text-slate-500 text-sm italic font-medium">"{query}" komutunu neural ağda işlemek için ENTER'a basın.</p>
             </div>
           )}
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-black/60 px-8">
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Grounded Knowledge System Active</span>
              <div className="h-4 w-px bg-white/5" />
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Model: Gemini 3 Pro</span>
           </div>
           <button onClick={onClose} className="text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors">Kapat (ESC)</button>
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch;
