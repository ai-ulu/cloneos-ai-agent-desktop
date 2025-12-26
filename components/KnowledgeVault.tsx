
import React, { useState } from 'react';
import { 
  Search, Trash2, Clock, BrainCircuit, Layers, ArrowUpRight, ShieldCheck, Database
} from 'lucide-react';
import { KnowledgeItem } from '../types';

interface KnowledgeVaultProps {
  items: KnowledgeItem[];
  onDelete: (id: string) => void;
}

const KnowledgeVault: React.FC<KnowledgeVaultProps> = ({ items, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#030305] text-slate-300 overflow-hidden font-sans">
      <div className="p-6 lg:p-8 border-b border-white/5 bg-zinc-950/40 backdrop-blur-3xl shrink-0">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <Database className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">İstihbarat Bankası</h3>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">Kalıcı Şifreli Depolama</span>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Hafızayı tara..."
              className="w-full bg-black/60 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar bg-black/20">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <div className="w-32 h-32 border border-dashed border-white/20 rounded-full flex items-center justify-center mb-8">
               <Layers className="w-16 h-16" />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.3em]">Hafıza Hücreleri Boş</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="group bg-zinc-900/30 border border-white/5 rounded-[32px] p-6 hover:bg-zinc-900/60 hover:border-cyan-500/30 transition-all shadow-2xl flex flex-col h-72 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/40 text-[8px] font-black uppercase rounded-lg">
                    {item.type}
                  </span>
                  <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-700 hover:text-rose-500 transition-colors active:scale-90">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-white font-bold text-base mb-3 leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed flex-1">
                  {item.content}
                </p>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-600 uppercase">
                    <Clock className="w-3 h-3" /> 
                    {new Date(item.timestamp).toLocaleDateString('tr-TR')}
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeVault;
