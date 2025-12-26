
import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/ai';
import { 
  Terminal as TerminalIcon, Loader2, Brain, 
  CheckCircle2, AlertTriangle, Workflow, Lightbulb, 
  Search, Code, ShieldCheck, Zap,
  Layers, MessageSquare, MessageSquareCode, Network, RefreshCcw, Boxes,
  ShieldAlert, Bug, Wand2, FlaskConical, Beaker, ClipboardCheck,
  ArrowUpRight, FileCode, Check, Shield, Skull, ChevronDown, ChevronUp,
  Share2, Database, MessageCircle, FastForward, Cpu, ImageIcon, Upload, Camera, ExternalLink, Globe
} from 'lucide-react';
import { CloneProfile, KnowledgeItem, AgentTask, SubTask, SubAgent, Notification } from '../types';

const AGENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  researcher: <Search className="w-3.5 h-3.5" />,
  coder: <Code className="w-3.5 h-3.5" />,
  debugger: <ShieldCheck className="w-3.5 h-3.5" />,
  architect: <Layers className="w-3.5 h-3.5" />,
  analyst: <Zap className="w-3.5 h-3.5" />
};

interface AgentTerminalProps {
  profile: CloneProfile;
  onSaveToVault?: (item: KnowledgeItem) => void;
  onPushCode: (name: string, content: string) => void;
  onNotify: (title: string, message: string, type: Notification['type']) => void;
}

const AgentTerminal: React.FC<AgentTerminalProps> = ({ profile, onSaveToVault, onPushCode, onNotify }) => {
  const [goal, setGoal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);
  const [pushedFiles, setPushedFiles] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<{msg: string, type: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const addLog = (msg: string, type: string = 'action') => {
    setLogs(prev => [...prev, { msg, type }]);
  };

  const handleImageAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    addLog(`Neural Vision Engine aktif. Optik veri taranıyor...`, 'vision');
    onNotify('Neural Vision', 'Görsel veri işleniyor...', 'info');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await aiService.analyzeImage(
        "Bu görüntüyü teknik olarak analiz et. Varsa kod hatalarını veya mimari örüntüleri belirle.", 
        base64, 
        file.type
      );
      addLog(`Vision Analizi Tamamlandı: ${result}`, 'success');
      onNotify('Vision Raporu', 'Görsel başarıyla analiz edildi.', 'success');
      setIsAnalyzingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const startOrchestration = async () => {
    if (!goal.trim() || isProcessing) return;
    setIsProcessing(true);
    setLogs([]);
    setActiveTask(null);
    setPushedFiles(new Set());
    addLog(`Otonom Ajan Orkestrası başlatılıyor: ${profile.name}`, 'thought');
    onNotify('Operasyon Başladı', 'Otonom ajanlar sahaya iniyor.', 'agent');

    try {
      const planData = await aiService.generateAutonomousPlan(goal, profile);
      
      const spawnedAgents: SubAgent[] = planData.agents.map((a: any) => ({
        id: Math.random().toString(),
        name: a.name,
        specialization: a.specialization,
        status: 'idle'
      }));

      const newTask: AgentTask = {
        id: Math.random().toString(),
        goal,
        status: 'executing',
        reasoning: planData.reasoning,
        agents: spawnedAgents,
        sharedInsights: [],
        subtasks: planData.subtasks.map((st: any) => ({
          ...st,
          id: Math.random().toString(),
          status: 'pending',
          assignedAgentId: spawnedAgents.find(sa => sa.name === st.agentName)?.id
        })),
        timestamp: new Date()
      };

      setActiveTask(newTask);
      addLog(`${spawnedAgents.length} uzman ajan otonom olarak atandı.`, 'spawn');

      let currentContext: string[] = [];

      for (const st of newTask.subtasks) {
        const agent = spawnedAgents.find(a => a.id === st.assignedAgentId);
        if (!agent) continue;

        setActiveTask(prev => prev ? {
          ...prev,
          subtasks: prev.subtasks.map(s => s.id === st.id ? { ...s, status: 'running' } : s),
          agents: prev.agents.map(a => a.id === agent.id ? { ...a, status: 'working' } : a)
        } : null);

        addLog(`[${agent.name}] ${st.title} görevine kilitlendi.`, 'action');
        addLog(`[System] Google Search Grounding aktif. Web taranıyor...`, 'comms');
        
        let executionResult = await aiService.executeStep(st.description, agent, profile, "", currentContext);
        
        if (executionResult.success) {
          addLog(`[System] Neural doğrulama başlatıldı...`, 'thought');
          const verification = await aiService.verifyStep(st.description, executionResult.text || "", agent);
          
          if (!verification.isValid) {
            addLog(`[HATA] ${verification.criticalFlaw}`, 'error');
            onNotify('Otonom Düzeltme', `${agent.name} hatayı onarıyor.`, 'warning');
            executionResult = await aiService.executeStep(st.description, agent, profile, verification.suggestedFix, currentContext);
          }
        }

        let handoff = "";
        if (executionResult.success) {
          handoff = await aiService.generateHandoff(st.description, executionResult.text || "", agent);
          if (handoff) currentContext.push(`[${agent.name}] ${handoff}`);
        }

        setActiveTask(prev => prev ? {
          ...prev,
          sharedInsights: [...currentContext],
          subtasks: prev.subtasks.map(s => s.id === st.id ? { 
            ...s, 
            status: executionResult.success ? 'completed' : 'failed', 
            result: executionResult.text,
            handoff: handoff
          } : s),
          agents: prev.agents.map(a => a.id === agent.id ? { ...a, status: executionResult.success ? 'done' : 'failed' } : a)
        } : null);

        if (executionResult.success) addLog(`${agent.name} görevini başarıyla tamamladı.`, 'success');
        else addLog(`${agent.name} başarısız oldu.`, 'error');
      }

      setActiveTask(prev => prev ? { ...prev, status: 'completed' } : null);
      addLog("Tüm hedefler başarıyla ele geçirildi.", 'success');
      onNotify('Operasyon Başarılı', 'Ajan orkestrası görevini bitirdi.', 'success');
    } catch (error) {
      addLog("Kritik Sistem Hatası: Planlama motoru durduruldu.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePushCode = (taskId: string, title: string, content: string) => {
    const codeMatch = content.match(/```(?:[a-z]*)\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1] : content;
    const ext = content.includes('def ') ? 'py' : 'js';
    const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}.${ext}`;
    onPushCode(fileName, code);
    setPushedFiles(prev => new Set(prev).add(taskId));
  };

  return (
    <div className="flex h-full bg-[#050508] text-slate-400 font-mono text-[11px] overflow-hidden">
      <div className="w-80 border-r border-white/5 bg-black/60 flex flex-col shrink-0">
        <div className="p-5 border-b border-white/5 bg-zinc-950/80 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Network className="w-4 h-4 text-cyan-500 animate-pulse" />
              <span className="font-black uppercase tracking-widest text-white">Mesh Network</span>
           </div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {logs.map((log, i) => (
            <div key={i} className={`p-4 rounded-[20px] border transition-all animate-in slide-in-from-left-2 ${
              log.type === 'thought' ? 'bg-purple-500/10 border-purple-500/20 text-purple-200' :
              log.type === 'spawn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
              log.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
              log.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
              'bg-white/5 border-white/5 text-slate-400'
            }`}>
              <div className="text-[7px] font-black uppercase opacity-40 mb-1">{log.type}</div>
              {log.msg}
            </div>
          ))}
        </div>
        <div className="p-6 bg-zinc-950/90 border-t border-white/5 space-y-4">
           <div className="relative">
              <textarea 
                value={goal} onChange={e => setGoal(e.target.value)}
                placeholder="Görev emrini otonom ağa gönder..."
                className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs text-white focus:border-cyan-500/50 outline-none resize-none h-28 mb-0"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                 <input type="file" ref={fileInputRef} onChange={handleImageAnalysis} className="hidden" accept="image/*" />
                 <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-cyan-400">
                    {isAnalyzingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                 </button>
              </div>
           </div>
           <button 
             onClick={startOrchestration} disabled={isProcessing || !goal.trim()}
             className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white p-4 rounded-2xl font-black uppercase transition-all flex items-center justify-center gap-2 shadow-2xl shadow-cyan-900/40"
           >
             {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Workflow className="w-4 h-4" />} Ajanları Başlat
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-grid-white/[0.01] flex flex-col gap-12">
        {activeTask ? (
          <div className="max-w-5xl mx-auto w-full space-y-10">
            {/* Blackboard Visualization */}
            <div className="bg-zinc-950/60 border border-white/5 p-10 rounded-[56px] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Brain className="w-32 h-32" /></div>
               <div className="flex items-center gap-4 mb-8">
                  <Database className="w-5 h-5 text-cyan-500" />
                  <h4 className="text-xs font-black text-white uppercase tracking-[0.4em]">Sürü Ortak Zekası</h4>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTask.sharedInsights.map((insight, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 p-6 rounded-[32px] flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                       <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                       <span className="text-[12px] text-slate-300 leading-relaxed font-medium italic">"{insight}"</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-8">
              {activeTask.subtasks.map((st, i) => {
                const agent = activeTask.agents.find(a => a.id === st.assignedAgentId);
                return (
                  <div key={st.id} className={`p-10 rounded-[48px] border transition-all duration-700 ${
                    st.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20' :
                    st.status === 'running' ? 'bg-cyan-500/10 border-cyan-500/40 shadow-2xl' : 'bg-white/5 border-white/5 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${
                            st.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-slate-500'
                          }`}>{i + 1}</div>
                          <div>
                             <h5 className="text-lg font-black text-white tracking-tight">{st.title}</h5>
                             <p className="text-xs text-slate-500 tracking-wide mt-1">{st.description}</p>
                          </div>
                       </div>
                       {agent && (
                         <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/10">
                            {AGENT_TYPE_ICONS[agent.specialization]}
                            <span className="text-[10px] font-black uppercase text-white tracking-widest">{agent.name}</span>
                         </div>
                       )}
                    </div>
                    {st.result && (
                      <div className="space-y-6">
                         <div className="bg-black/60 p-8 rounded-[36px] border border-white/5 text-[12px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap">
                            {st.result}
                         </div>
                         <div className="flex justify-end gap-4">
                            <button onClick={() => handlePushCode(st.id, st.title, st.result!)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${
                               pushedFiles.has(st.id) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl shadow-cyan-900/40'
                            }`}>
                               {pushedFiles.has(st.id) ? 'Workspace\'e Aktarıldı' : 'Workspace\'e Gönder'}
                            </button>
                         </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
             <div className="p-12 border-2 border-dashed border-white/20 rounded-[60px] animate-pulse">
                <Brain className="w-24 h-24 text-white" />
             </div>
             <span className="text-xs font-black uppercase tracking-[0.5em] mt-10">Otonom Ajan Bekleniyor</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentTerminal;
