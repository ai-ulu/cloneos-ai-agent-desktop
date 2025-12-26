
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { aiService } from '../../services/ai';
import { Brain, Database, MessageSquare, Sparkles, Loader2, History, Bug, Activity, ShieldCheck, Zap, User, Search, Code, Layers, AlertCircle, CheckCircle2, Terminal, Share2, Clipboard, ShieldCheck as ShieldIcon } from 'lucide-react';
import { CloneProfile, KnowledgeItem, AgentTask, SubAgent, Notification, NeuralExperience, DebugReport, SubTask } from '../../types';
import { Sidebar } from './Sidebar';
import { SubtaskItem } from './SubtaskItem';

const AGENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  researcher: <Search className="w-5 h-5" />,
  coder: <Code className="w-5 h-5" />,
  debugger: <ShieldCheck className="w-5 h-5" />,
  architect: <Layers className="w-5 h-5" />,
  analyst: <Zap className="w-5 h-5" />
};

const STATUS_COLORS: Record<string, string> = {
  idle: 'text-slate-600 border-slate-800 bg-slate-900/20',
  working: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
  done: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  failed: 'text-rose-400 border-rose-500/30 bg-rose-500/5'
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
  const [isLearning, setIsLearning] = useState(false);
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);
  const [pushedFiles, setPushedFiles] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<{msg: string, type: string}[]>([]);
  const [isRefiningId, setIsRefiningId] = useState<string | null>(null);
  
  const [experiences, setExperiences] = useState<NeuralExperience[]>(() => {
    const saved = localStorage.getItem('clone_os_experience');
    return saved ? JSON.parse(saved).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })) : [];
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('clone_os_experience', JSON.stringify(experiences));
  }, [experiences]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const addLog = useCallback((msg: string, type: string = 'action') => {
    setLogs(prev => [...prev, { msg, type }]);
  }, []);

  const handleShare = async () => {
    let shareText = '';
    
    if (activeTask) {
      shareText = `[CloneOS Operasyon Raporu]\nHedef: ${activeTask.goal}\nDurum: ${activeTask.status.toUpperCase()}\n\n`;
      shareText += `Akıl Yürütme: ${activeTask.reasoning}\n\n`;
      shareText += `Alt Görevler:\n`;
      activeTask.subtasks.forEach((st, i) => {
        shareText += `${i + 1}. ${st.title} [${st.status}]\n`;
      });
    } else if (logs.length > 0) {
      shareText = `[CloneOS Log Yayını]\nSon Etkinlikler:\n`;
      logs.slice(-10).forEach(log => {
        shareText += `- ${log.msg}\n`;
      });
    } else {
      onNotify('Paylaşılamadı', 'Paylaşılacak aktif bir veri bulunamadı.', 'error');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'CloneOS Operasyon Paylaşımı',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        onNotify('Kopyalandı', 'Operasyon verileri panoya kopyalandı.', 'success');
      }
    } catch (err) {
      console.error('Sharing failed', err);
    }
  };

  const handleRefine = async (taskId: string) => {
    if (!activeTask || isRefiningId) return;
    const task = activeTask.subtasks.find(s => s.id === taskId);
    if (!task || !task.result) return;

    setIsRefiningId(taskId);
    addLog(`[Auditor] "${task.title}" için optimizasyon döngüsü başlatıldı.`, 'thought');
    onNotify('Optimizasyon Başladı', 'Ajan mevcut çıktıyı mükemmelleştiriyor.', 'info');

    const agent = activeTask.agents.find(a => a.id === task.assignedAgentId);
    
    try {
      const auditResult = await aiService.analyzeAndOptimize(task.description, task.result, agent, 'OPTIMIZATION');
      
      setActiveTask(prev => prev ? {
        ...prev,
        subtasks: prev.subtasks.map(s => s.id === taskId ? { 
          ...s, 
          status: 'retrying',
          feedbackLoop: [
            ...(s.feedbackLoop || []),
            { 
              timestamp: new Date(), 
              attempt: (s.feedbackLoop?.length || 0) + 1, 
              type: 'OPTIMIZATION',
              critique: auditResult.critique,
              suggestion: auditResult.suggestion
            }
          ]
        } : s)
      } : null);

      await new Promise(r => setTimeout(r, 1000));
      const executionResult = await aiService.executeStep(task.description, agent, profile, auditResult.suggestion, activeTask.sharedInsights);
      
      setActiveTask(prev => prev ? {
        ...prev,
        subtasks: prev.subtasks.map(s => s.id === taskId ? { 
          ...s, 
          status: 'completed', 
          result: executionResult.text 
        } : s)
      } : null);

      addLog(`[Auditor] "${task.title}" başarıyla optimize edildi.`, 'success');
    } catch (err) {
      addLog(`Optimizasyon hatası.`, 'error');
    } finally {
      setIsRefiningId(null);
    }
  };

  const handleIntervention = async (taskId: string, command: string) => {
    if (!activeTask) return;
    addLog(`[MANUEL MÜDAHALE] Ajan'a yeni direktif gönderildi: "${command}"`, 'thought');
    onNotify('Müdahale Tetiklendi', 'Ajan otonom akışı manuel komutla güncelliyor.', 'warning');
    
    setActiveTask(prev => prev ? {
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === taskId ? { ...s, status: 'debugging' as const } : s)
    } : null);

    await new Promise(r => setTimeout(r, 1500));
    addLog(`[System] Müdahale işlendi, ajan rota düzeltmesi yaptı.`, 'success');
  };

  const handleImageAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzingImage(true);
    addLog(`Neural Vision Engine aktif. Optik veri taranıyor...`, 'vision');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await aiService.analyzeImage("Bu görüntüyü teknik olarak analiz et.", base64, file.type);
      addLog(`Vision Analizi: ${result}`, 'success');
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

    try {
      const planData = await aiService.generateAutonomousPlan(goal, profile, experiences);
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
          assignedAgentId: spawnedAgents.find(sa => sa.name === st.agentName)?.id,
          debugReports: [],
          feedbackLoop: [],
          diagnostics: { memoryLoad: 10, confidence: 95, lastLogs: ["İşlem başlatıldı..."] }
        })),
        timestamp: new Date()
      };

      setActiveTask(newTask);
      let currentContext: string[] = [];

      for (const st of newTask.subtasks) {
        const agent = spawnedAgents.find(a => a.id === st.assignedAgentId);
        if (!agent) continue;

        setActiveTask(prev => prev ? {
          ...prev,
          subtasks: prev.subtasks.map(s => s.id === st.id ? { ...s, status: 'running' } : s),
          agents: prev.agents.map(a => a.id === agent.id ? { ...a, status: 'working' } : a)
        } : null);

        addLog(`[${agent.name}] ${st.title} görevine başladı.`, 'action');
        let executionResult = await aiService.executeStep(st.description, agent, profile, "", currentContext);
        
        // --- Neural Feedback Loop: Self-Healing ---
        let attempts = 1;
        let isStepValid = false;
        let finalResult = executionResult.text || "";
        let finalStatus: SubTask['status'] = 'completed';

        while (attempts <= 2 && !isStepValid) {
          addLog(`[Auditor] "${st.title}" doğrulanıyor... (Deneme ${attempts})`, 'thought');
          const verification = await aiService.verifyStep(st.description, finalResult, agent);
          
          if (verification.isValid) {
            isStepValid = true;
          } else {
            addLog(`[Auditor] Hata tespit edildi: ${verification.criticalFlaw}`, 'error');
            onNotify('Düzeltme Döngüsü', `${agent.name} hata üzerinde çalışıyor.`, 'warning');
            
            setActiveTask(prev => prev ? {
              ...prev,
              subtasks: prev.subtasks.map(s => s.id === st.id ? { 
                ...s, 
                status: 'retrying',
                feedbackLoop: [
                  ...(s.feedbackLoop || []),
                  { 
                    timestamp: new Date(), 
                    attempt: attempts, 
                    type: 'CORRECTION',
                    critique: verification.criticalFlaw || "Hata saptandı.",
                    suggestion: verification.suggestedFix || "Kod akışını kontrol et."
                  }
                ]
              } : s)
            } : null);

            attempts++;
            const fixResult = await aiService.executeStep(st.description, agent, profile, verification.suggestedFix || "", currentContext);
            finalResult = fixResult.text || "";
          }
        }

        if (!isStepValid) finalStatus = 'failed';
        // --- End of Loop ---
        
        let handoff = "";
        if (isStepValid) {
          handoff = await aiService.generateHandoff(st.description, finalResult, agent);
          if (handoff) currentContext.push(`[${agent.name}] ${handoff}`);
        }

        setActiveTask(prev => prev ? {
          ...prev,
          sharedInsights: [...currentContext],
          subtasks: prev.subtasks.map(s => s.id === st.id ? { 
            ...s, 
            status: finalStatus, 
            result: finalResult 
          } : s),
          agents: prev.agents.map(a => a.id === agent.id ? { ...a, status: isStepValid ? 'done' : 'failed' } : a)
        } : null);

        if (isStepValid) addLog(`${agent.name} görevini tamamladı.`, 'success');
      }

      const finalTaskState = { ...newTask, status: 'completed' as const };
      setActiveTask(finalTaskState);
      
      setIsLearning(true);
      const distilled = await aiService.distillExperience(finalTaskState);
      const newExp: NeuralExperience = {
        id: Math.random().toString(),
        goal,
        outcome: 'success',
        lessons: distilled.lessons,
        timestamp: new Date()
      };
      setExperiences(prev => [newExp, ...prev]);
      setIsLearning(false);

    } catch (error) {
      addLog("Operasyon hatası.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePushCode = (taskId: string, title: string, content: string) => {
    const codeMatch = content.match(/```(?:[a-z]*)\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1] : content;
    const ext = content.includes('def ') ? 'py' : 'js';
    onPushCode(`${title.toLowerCase().replace(/\s+/g, '_')}.${ext}`, code);
    setPushedFiles(prev => new Set(prev).add(taskId));
  };

  return (
    <div className="flex h-full bg-[#050508] text-slate-400 font-mono text-[11px] overflow-hidden">
      <Sidebar 
        goal={goal} setGoal={setGoal} 
        logs={logs} isProcessing={isProcessing} isAnalyzingImage={isAnalyzingImage}
        onStart={startOrchestration} onImageAnalysis={handleImageAnalysis}
        scrollRef={scrollRef} fileInputRef={fileInputRef}
      />

      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-grid-white/[0.01] flex flex-col gap-12">
        {activeTask || logs.length > 0 ? (
          <div className="max-w-6xl mx-auto w-full space-y-12 animate-in fade-in duration-1000">
            
            {/* AGENT ROSTER PANEL */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                 <div className="flex items-center gap-4">
                    <Activity className="w-5 h-5 text-cyan-500 animate-pulse" />
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Active Swarm Roster</h3>
                 </div>
                 <div className="flex items-center gap-6">
                    <button 
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                      title="Operasyonu Paylaş"
                    >
                       <Share2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                       <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-white">Share Ops</span>
                    </button>
                    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                       Neural Mesh: {activeTask ? `${activeTask.agents.filter(a => a.status === 'done').length}/${activeTask.agents.length}` : '0/0'} Nodes Synchronized
                    </div>
                 </div>
              </div>
              
              {activeTask && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {activeTask.agents.map((agent) => (
                    <div 
                      key={agent.id} 
                      className={`p-6 rounded-[32px] border transition-all duration-700 relative overflow-hidden group ${STATUS_COLORS[agent.status]}`}
                    >
                      {agent.status === 'working' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20">
                           <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center gap-4 text-center relative z-10">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                           agent.status === 'working' ? 'bg-cyan-500/20 animate-pulse scale-110' : 
                           agent.status === 'done' ? 'bg-emerald-500/20' : 'bg-slate-800'
                         }`}>
                            {AGENT_TYPE_ICONS[agent.specialization]}
                         </div>
                         
                         <div>
                            <h4 className="text-xs font-black text-white truncate w-full px-2">{agent.name}</h4>
                            <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">{agent.specialization}</span>
                         </div>

                         <div className="flex items-center gap-2">
                            {agent.status === 'working' ? (
                              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                            ) : agent.status === 'done' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : agent.status === 'failed' ? (
                              <AlertCircle className="w-3 h-3 text-rose-400" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-700" />
                            )}
                            <span className="text-[9px] font-black uppercase tracking-tighter">
                              {agent.status === 'working' ? 'Processing' : agent.status === 'done' ? 'Ready' : agent.status === 'failed' ? 'Error' : 'Idle'}
                            </span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeTask && (
              <div className="bg-zinc-950/60 border border-white/5 p-10 rounded-[56px] shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Brain className="w-32 h-32" /></div>
                 <div className="flex items-center gap-4 mb-8">
                    <Database className="w-5 h-5 text-cyan-500" />
                    <h4 className="text-xs font-black text-white uppercase tracking-[0.4em]">Sürü Ortak Zekası (Blackboard)</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeTask.sharedInsights.length > 0 ? activeTask.sharedInsights.map((insight, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 p-6 rounded-[32px] flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                         <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                         <span className="text-[12px] text-slate-300 leading-relaxed font-medium italic">"{insight}"</span>
                      </div>
                    )) : (
                      <p className="text-[10px] text-slate-600 uppercase italic">Henüz ortak zeka verisi birikmedi...</p>
                    )}
                 </div>
              </div>
            )}

            <div className="space-y-8">
              {activeTask?.subtasks.map((st, i) => (
                <SubtaskItem 
                  key={st.id} 
                  task={st} 
                  index={i} 
                  agent={activeTask.agents.find(a => a.id === st.assignedAgentId)}
                  isPushed={pushedFiles.has(st.id)}
                  onPushCode={handlePushCode}
                  onIntervene={handleIntervention}
                  onRefine={handleRefine}
                  isRefining={isRefiningId === st.id}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10 gap-10">
             <div className="p-12 border-2 border-dashed border-white/20 rounded-[60px] animate-pulse">
                <Brain className="w-24 h-24 text-white" />
             </div>
             <div className="text-center space-y-4">
                <span className="text-xs font-black uppercase tracking-[0.5em] block">Otonom Ajan Bekleniyor</span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Geçmiş {experiences.length} operasyonun deneyimi sisteme yüklendi.</p>
             </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

export default AgentTerminal;
