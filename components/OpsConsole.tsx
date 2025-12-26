
import React, { useState, useEffect } from 'react';
import { 
  Cloud, Server, Activity, Shield, Terminal as TermIcon, 
  Cpu, HardDrive, Globe, RefreshCw, CheckCircle2, AlertCircle, TrendingUp, Zap, Radio
} from 'lucide-react';
import { aiService } from '../services/ai';

const OpsConsole: React.FC = () => {
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'warn'}[]>([]);
  const [metrics, setMetrics] = useState({ cpu: 15, ram: 22, net: 4 });
  const [prediction, setPrediction] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const addLog = (msg: string, type: 'info' | 'success' | 'warn' = 'info') => {
      setLogs(prev => [...prev.slice(-25), { msg, type }]);
    };

    const interval = setInterval(() => {
      const newMetrics = {
        cpu: Math.min(100, 10 + Math.random() * 20),
        ram: Math.min(100, 20 + Math.random() * 5),
        net: Math.random() * 50
      };
      setMetrics(newMetrics);
      if(Math.random() > 0.85) addLog(`İstek karşılandı: GET /api/v4/neural-sync - 200 OK`, 'success');
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Neural Prediction logic
  const runPrediction = async () => {
    setIsSyncing(true);
    const result = await aiService.getPredictiveTelemetry(metrics);
    setPrediction(result);
    setIsSyncing(false);
  };

  useEffect(() => {
    const timer = setInterval(runPrediction, 15000); // Every 15s predict the future
    runPrediction();
    return () => clearInterval(timer);
  }, [metrics.cpu]);

  return (
    <div className="flex h-full bg-[#050508] text-slate-400 font-mono text-[11px] overflow-hidden">
      <div className="flex-1 flex flex-col p-10 space-y-10 overflow-y-auto custom-scrollbar">
        
        {/* Real-time Telemetry Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[40px] space-y-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><Cpu className="w-16 h-16 text-cyan-400" /></div>
             <div className="flex justify-between items-center text-cyan-400 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural CPU Core</span>
                <Radio className="w-4 h-4 animate-pulse" />
             </div>
             <div className="text-5xl font-black text-white relative z-10">{Math.round(metrics.cpu)}%</div>
             <div className="h-2 bg-white/5 rounded-full overflow-hidden relative z-10">
                <div className={`h-full transition-all duration-1000 ${metrics.cpu > 80 ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : 'bg-cyan-500 shadow-[0_0_15px_#06b6d4]'}`} style={{width: `${metrics.cpu}%`}} />
             </div>
          </div>
          <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[40px] space-y-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><HardDrive className="w-16 h-16 text-purple-400" /></div>
             <div className="flex justify-between items-center text-purple-400 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synaptic RAM</span>
                <Activity className="w-4 h-4" />
             </div>
             <div className="text-5xl font-black text-white relative z-10">{Math.round(metrics.ram)}%</div>
             <div className="h-2 bg-white/5 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-purple-500 shadow-[0_0_15px_#a855f7] transition-all duration-1000" style={{width: `${metrics.ram}%`}} />
             </div>
          </div>
          <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[40px] space-y-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><Globe className="w-16 h-16 text-emerald-400" /></div>
             <div className="flex justify-between items-center text-emerald-400 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mesh Network</span>
                <TrendingUp className="w-4 h-4" />
             </div>
             <div className="text-5xl font-black text-white relative z-10">{Math.round(metrics.net)}<span className="text-lg ml-2 opacity-30">Mb/s</span></div>
             <div className="h-2 bg-white/5 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981] transition-all duration-1000" style={{width: `${(metrics.net / 50) * 100}%`}} />
             </div>
          </div>
        </div>

        {/* Predictive AI Analytics Panel */}
        <div className="bg-zinc-900/20 border border-cyan-500/20 rounded-[48px] p-10 space-y-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Zap className="w-64 h-64 text-cyan-400" /></div>
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">AI Predictive Telemetry</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500/60 italic">Neural Simulator v2.0 (Gemini 3 Flash Powered)</span>
                 </div>
              </div>
              <button onClick={runPrediction} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                 <RefreshCw className={`w-5 h-5 text-slate-500 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">5-Min Neural Forecast</h4>
                 <div className="flex items-end gap-3 h-48 px-4">
                    {prediction?.forecast ? prediction.forecast.map((f: any, i: number) => (
                       <div key={i} className="flex-1 group relative">
                          <div 
                             className={`w-full rounded-t-xl transition-all duration-1000 ${f.cpu > 60 ? 'bg-rose-500/60' : 'bg-cyan-500/40'}`} 
                             style={{ height: `${f.cpu}%` }}
                          >
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 p-2 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] whitespace-nowrap z-50">
                                CPU: {f.cpu}% | {f.risk}
                             </div>
                          </div>
                          <span className="text-[7px] text-slate-700 font-bold block mt-3 rotate-45">{f.time}</span>
                       </div>
                    )) : (
                       <div className="w-full h-full flex items-center justify-center opacity-10">
                          <span className="text-[10px] font-black uppercase tracking-widest">Simülasyon Verisi Bekleniyor...</span>
                       </div>
                    )}
                 </div>
              </div>
              
              <div className="bg-black/40 border border-white/5 p-8 rounded-[40px] flex flex-col justify-between">
                 <div>
                    <div className="flex items-center gap-3 text-emerald-400 mb-6">
                       <Shield className="w-5 h-5" />
                       <span className="text-[11px] font-black uppercase tracking-widest">Sistem Sağlık Raporu</span>
                    </div>
                    <p className="text-base text-slate-200 leading-relaxed italic">
                       {prediction?.alert || "Sistem kararlı. Herhangi bir anomali tespit edilmedi. Neural mesh senkronizasyonu %99.4."}
                    </p>
                 </div>
                 <div className="flex gap-4 mt-8">
                    <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                       <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Olası Downtime</span>
                       <span className="text-sm font-black text-white">0% Risk</span>
                    </div>
                    <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                       <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Optimizasyon</span>
                       <span className="text-sm font-black text-emerald-400">AKTİF</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Real-time Logs Console */}
        <div className="flex-1 bg-black/40 border border-white/5 rounded-[48px] p-10 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
             <div className="flex items-center gap-4 text-white">
                <TermIcon className="w-5 h-5 text-cyan-400" /> 
                <span className="text-base font-black uppercase tracking-tighter">CloneOS Mesh Logs</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase">Live Stream</span>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-6">
             {logs.map((log, i) => (
               <div key={i} className={`flex gap-4 leading-relaxed animate-in slide-in-from-left-4 duration-300 ${log.type === 'success' ? 'text-emerald-400' : log.type === 'warn' ? 'text-amber-400' : 'text-slate-500'}`}>
                  <span className="opacity-20 font-black tracking-widest">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className="font-medium">{log.msg}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Control Control Sidebar */}
      <div className="w-80 border-l border-white/5 bg-zinc-950/40 p-10 space-y-10 shrink-0">
         <div>
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-8">Node Management</h4>
            <div className="space-y-4">
               {[
                 { name: 'Core Engine', status: 'online' },
                 { name: 'Synapse Database', status: 'online' },
                 { name: 'Vision Processor', status: 'standby' },
                 { name: 'Swarm Mesh', status: 'syncing' }
               ].map(node => (
                 <div key={node.name} className="flex flex-col gap-2 p-5 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-cyan-500/20 transition-all">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">{node.name}</span>
                       <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : node.status === 'syncing' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">{node.status}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="pt-10 border-t border-white/5 space-y-4">
            <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white p-6 rounded-[32px] font-black text-xs uppercase transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-cyan-900/20">
               <Cloud className="w-5 h-5" /> Push to Production
            </button>
            <button className="w-full bg-white/5 hover:bg-white/10 text-white p-6 rounded-[32px] font-black text-xs uppercase transition-all flex items-center justify-center gap-3 border border-white/10">
               <Server className="w-5 h-5" /> Global Reset
            </button>
         </div>
      </div>
    </div>
  );
};

export default OpsConsole;
