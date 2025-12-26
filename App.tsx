
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEMES, APP_ICONS, DEFAULT_CLONE_PROFILE } from './constants';
import { CloneProfile, KnowledgeItem, AppTheme, Notification, AgentTask, LedgerEntry, DimensionType } from './types';
import { useWindows } from './hooks/useWindows';
import { aiService } from './services/ai';
import Window from './components/Window';
import ChatApp from './components/ChatApp';
import LiveVoiceApp from './components/LiveVoiceApp';
import CloneConfig from './components/CloneConfig';
import AgentTerminal from './components/AgentTerminal/AgentTerminal';
import KnowledgeVault from './components/KnowledgeVault';
import CodeWorkspace from './components/CodeWorkspace';
import SocialHub from './components/SocialHub';
import OpsConsole from './components/OpsConsole';
import SpotlightSearch from './components/SpotlightSearch';
import SwarmNexus from './components/SwarmNexus';
import NeuralBriefing from './components/NeuralBriefing';
import NeuralStatus from './components/NeuralStatus';
import QuantumLedger from './components/QuantumLedger';
import LiquidBackground from './components/LiquidBackground';
import BootSequence from './components/BootSequence';
import HelpCenter from './components/HelpCenter';
import InterviewPro from './components/InterviewPro';
import NeuralSettings from './components/NeuralSettings';
import DimensionalNexus from './components/DimensionalNexus';
import NeuralSingularity from './components/NeuralSingularity';
import GitHubSync from './components/GitHubSync';
import InterpreterApp from './components/InterpreterApp';
import { Search, Brain, User, Activity, MapPin, Zap, Star, ShieldCheck, MessageCircle, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const { windows, openWindow, closeWindow, focusWindow, toggleMaximize, minimizeWindow } = useWindows();
  
  const [profile, setProfile] = useState<CloneProfile>(() => {
    const saved = localStorage.getItem('clone_os_profile');
    return saved ? JSON.parse(saved) : DEFAULT_CLONE_PROFILE;
  });

  const [activeTheme, setActiveTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('clone_os_theme');
    return saved ? JSON.parse(saved) : THEMES[0];
  });

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>(() => {
    const saved = localStorage.getItem('clone_os_vault');
    return saved ? JSON.parse(saved) : [];
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('clone_os_ledger');
    return saved ? JSON.parse(saved).map((l:any) => ({...l, timestamp: new Date(l.timestamp)})) : [];
  });

  const [workspaceFiles, setWorkspaceFiles] = useState(() => {
    const saved = localStorage.getItem('clone_os_code_files');
    return saved ? JSON.parse(saved) : [
      { name: 'consciousness.py', content: 'def dream():\n    pass' }
    ];
  });

  const [dimension, setDimension] = useState<DimensionType>('MATERIAL');
  const [isWarping, setIsWarping] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastSyncChange, setLastSyncChange] = useState('');
  const [nudge, setNudge] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('clone_os_profile', JSON.stringify(profile));
    localStorage.setItem('clone_os_vault', JSON.stringify(knowledgeBase));
    localStorage.setItem('clone_os_ledger', JSON.stringify(ledger));
    localStorage.setItem('clone_os_theme', JSON.stringify(activeTheme));
    localStorage.setItem('clone_os_code_files', JSON.stringify(workspaceFiles));
  }, [profile, knowledgeBase, ledger, activeTheme, workspaceFiles]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Proaktif Nudge Döngüsü
  useEffect(() => {
    const nudgeTimer = setInterval(async () => {
      if (windows.filter(w => w.isOpen && !w.isMinimized).length === 0 && !nudge) {
        const thought = await aiService.generateDream(profile, knowledgeBase);
        setNudge(thought);
        addLedgerEntry(`[Autonomous Insight]: ${thought}`, 'LEARNING');
        setTimeout(() => setNudge(null), 10000);
      }
    }, 45000);
    return () => clearInterval(nudgeTimer);
  }, [windows, profile, knowledgeBase, nudge]);

  const handleDimensionShift = (type: DimensionType) => {
    if (type === dimension) return;
    setIsWarping(true);
    setLastSyncChange(`Shifting to ${type} dimension`);
    setTimeout(() => {
      setDimension(type);
      addLedgerEntry(`Dimension shifted to: ${type}`, 'SYNC');
      setTimeout(() => setIsWarping(false), 800);
    }, 500);
  };

  const addLedgerEntry = useCallback((content: string, type: LedgerEntry['type']) => {
    const newEntry: LedgerEntry = {
      id: Math.random().toString(36).substring(7),
      content,
      type,
      timestamp: new Date()
    };
    setLedger(prev => [newEntry, ...prev].slice(0, 100));
    setLastSyncChange(content);
  }, []);

  const addNotification = (title: string, message: string, type: Notification['type']) => {
    console.log(`Notification: ${title} - ${message}`);
  };

  const renderContent = (id: string) => {
    switch (id) {
      case 'agent': return <AgentTerminal 
        profile={profile} 
        onPushCode={(name, content) => { 
          setWorkspaceFiles(prev => {
            const existingIdx = prev.findIndex(f => f.name === name);
            if (existingIdx !== -1) {
              const updatedFiles = [...prev];
              updatedFiles[existingIdx] = { name, content };
              return updatedFiles;
            }
            return [...prev, { name, content }];
          }); 
          setLastSyncChange(`Pushed code: ${name}`); 
          openWindow('code'); 
          addNotification('Kod Aktarıldı', `${name} başarıyla Workspace'e gönderildi.`, 'success');
        }} 
        onSaveToVault={item => { 
          setKnowledgeBase(prev => [item, ...prev]); 
          setLastSyncChange(`Saved vault item: ${item.title}`); 
        }} 
        onNotify={addNotification} 
      />;
      case 'vault': return <KnowledgeVault items={knowledgeBase} onDelete={id => setKnowledgeBase(prev => prev.filter(i => i.id !== id))} />;
      case 'chat': return <ChatApp profile={profile} />;
      case 'interpreter': return <InterpreterApp profile={profile} />;
      case 'live': return <LiveVoiceApp profile={profile} onOSAction={(args) => openWindow(args.target)} />;
      case 'config': return <CloneConfig profile={profile} onSave={setProfile} />;
      case 'code': return <CodeWorkspace files={workspaceFiles} setFiles={setWorkspaceFiles} patterns={[]} />;
      case 'social': return <SocialHub profile={profile} />;
      case 'ledger': return <QuantumLedger entries={ledger} onClose={() => closeWindow('ledger')} />;
      case 'settings': return <NeuralSettings activeTheme={activeTheme} onThemeChange={setActiveTheme} />;
      case 'help': return <HelpCenter />;
      case 'interview': return <InterviewPro profile={profile} />;
      default: return null;
    }
  };

  const getDimensionFilter = () => {
    if (dimension === 'ZENITH') return 'contrast(1.2) saturate(1.4) brightness(1.1) hue-rotate(-10deg)';
    if (dimension === 'ETHEREAL') return 'blur(0.2px) saturate(0.8) brightness(0.9) contrast(0.9)';
    return 'none';
  };

  const currentAccent = dimension === 'ZENITH' ? '#ec4899' : dimension === 'ETHEREAL' ? '#a855f7' : activeTheme.accent;

  return (
    <div 
      style={{ 
        fontFamily: activeTheme.fontFamily, 
        background: dimension === 'ETHEREAL' ? 'radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)' : activeTheme.background,
        transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
        filter: getDimensionFilter()
      }}
      className={`relative w-screen h-[100dvh] overflow-hidden text-slate-100 flex flex-col ${isWarping ? 'scale-90 opacity-0 blur-3xl' : 'scale-100 opacity-100 blur-0'}`}
    >
      {isBooting && <BootSequence onComplete={() => { setIsBooting(false); addLedgerEntry("Neural OS Core Ready.", "SYNC"); }} />}
      
      <LiquidBackground color={currentAccent} />
      
      <NeuralStatus profile={profile} knowledgeBase={knowledgeBase} />

      <NeuralSingularity 
        dimension={dimension} 
        isProcessing={windows.some(w => w.isOpen && !w.isMinimized)} 
        onClick={() => setShowSpotlight(true)}
      />

      <GitHubSync lastChange={lastSyncChange} />

      {nudge && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[200000] animate-in slide-in-from-top-10 duration-1000">
           <div className="bg-white/10 backdrop-blur-3xl border border-white/20 p-8 rounded-[40px] flex items-center gap-6 shadow-2xl max-w-xl">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center animate-bounce">
                 <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-bold text-slate-200 leading-relaxed italic">"{nudge}"</p>
              <button onClick={() => setNudge(null)} className="p-2 hover:bg-white/10 rounded-xl">
                <Activity className="w-4 h-4 text-slate-500" />
              </button>
           </div>
        </div>
      )}

      <div className="fixed top-14 left-14 right-14 flex items-center justify-between z-[100] animate-in fade-in duration-1000">
         <div className="p-4 bg-white/[0.03] rounded-3xl border border-white/10 flex items-center gap-3 backdrop-blur-xl">
            <Activity className={`w-4 h-4 ${dimension === 'ZENITH' ? 'text-pink-500' : 'text-cyan-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Quantum State: {dimension}</span>
         </div>
         <DimensionalNexus current={dimension} onShift={handleDimensionShift} />
      </div>

      <div className="absolute right-14 top-44 bottom-44 w-96 flex flex-col gap-10 z-10 pointer-events-none">
         <div className={`p-12 bg-white/[0.02] border border-white/5 backdrop-blur-[60px] rounded-[64px] space-y-8 pointer-events-auto transition-all duration-1000 ${dimension !== 'MATERIAL' ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
            <div className="flex items-center gap-6">
               <div className={`w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center transition-all duration-1000 ${dimension === 'ZENITH' ? 'ring-4 ring-pink-500 shadow-[0_0_50px_#ec4899]' : dimension === 'ETHEREAL' ? 'ring-4 ring-purple-500 shadow-[0_0_50px_#a855f7]' : ''}`}>
                  {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-slate-700" />}
               </div>
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{profile.name}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${dimension === 'ZENITH' ? 'text-pink-400' : dimension === 'ETHEREAL' ? 'text-purple-400' : 'text-emerald-500'}`}>
                     <div className={`w-2 h-2 rounded-full animate-pulse ${dimension === 'ZENITH' ? 'bg-pink-500' : dimension === 'ETHEREAL' ? 'bg-purple-500' : 'bg-emerald-500'}`} /> 
                     {dimension === 'MATERIAL' ? 'Neural Core Online' : `${dimension} Sync Active`}
                  </span>
               </div>
            </div>
            <div className="flex gap-4">
               <button onClick={() => openWindow('config')} className="flex-1 bg-white/5 hover:bg-white/10 p-5 rounded-2xl text-[10px] font-black uppercase text-slate-400 border border-white/5 transition-all">Profile</button>
               <button onClick={() => openWindow('settings')} className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 p-5 rounded-2xl text-[10px] font-black uppercase text-cyan-400 border border-cyan-500/20 transition-all">Tuning</button>
            </div>
         </div>
      </div>

      <div className="flex-1 p-32 lg:p-56 pr-[500px] pt-80 relative overflow-hidden">
        <div 
          style={{ filter: dimension === 'ETHEREAL' ? 'blur(10px)' : 'none' }}
          className={`grid grid-cols-[repeat(auto-fill,240px)] gap-y-40 gap-x-32 justify-start relative z-10 transition-all duration-[2000ms] ${dimension === 'ZENITH' ? 'scale-105' : 'scale-100'}`}
        >
          {windows.map(win => (
            <div key={win.id} onClick={() => openWindow(win.id)} className="group flex flex-col items-center gap-14 cursor-pointer w-56 active:scale-95 transition-all duration-500">
              <div 
                style={{ borderRadius: activeTheme.borderRadius }}
                className="w-44 h-44 bg-white/5 backdrop-blur-[60px] flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-cyan-500/60 transition-all duration-700 shadow-2xl relative"
              >
                <div style={{ color: currentAccent }} className="w-24 h-24 flex items-center justify-center transition-all group-hover:text-white group-hover:scale-110">
                  {APP_ICONS[win.id]}
                </div>
                {win.isOpen && <div style={{ backgroundColor: currentAccent, boxShadow: `0 0 50px ${currentAccent}` }} className="absolute -bottom-10 w-5 h-5 rounded-full animate-pulse" />}
              </div>
              <span className="text-[14px] font-black uppercase tracking-[0.6em] text-white/30 group-hover:text-white transition-all text-center px-8">
                {win.title}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {windows.map(win => win.isOpen && (
            <div key={win.id} className={`pointer-events-auto transition-all duration-[1000ms] ${dimension === 'ETHEREAL' ? 'scale-75 opacity-20 blur-xl' : 'scale-100 opacity-100 blur-0'}`}>
              <Window 
                id={win.id} title={win.title} icon={APP_ICONS[win.id]} zIndex={win.zIndex} 
                isMinimized={win.isMinimized} isMaximized={!!win.isMaximized}
                onClose={() => closeWindow(win.id)} onMinimize={() => minimizeWindow(win.id)} 
                onMaximize={() => toggleMaximize(win.id)} onFocus={() => focusWindow(win.id)}
                theme={activeTheme}
              >
                {renderContent(win.id)}
              </Window>
            </div>
          ))}
        </div>
      </div>

      {showSpotlight && <SpotlightSearch onClose={() => setShowSpotlight(false)} onAction={(res) => openWindow(res.target)} />}

      <div className={`fixed bottom-16 left-1/2 -translate-x-1/2 w-[94%] max-w-7xl z-[99999] transition-all duration-[1000ms] ${dimension === 'ETHEREAL' ? 'translate-y-64 opacity-0' : 'translate-y-0 opacity-100'}`}>
         <div 
          style={{ borderRadius: '80px', border: `1px solid ${currentAccent}20` }}
          className={`h-44 px-24 flex items-center justify-between border border-white/10 shadow-2xl ${activeTheme.taskbar} relative overflow-hidden`}
        >
            <div className="flex items-center gap-20 relative z-10">
               <button onClick={() => setShowSpotlight(true)} className="p-12 bg-white/5 rounded-[48px] hover:bg-white/10 transition-all text-white/40 border border-white/5">
                 <Search className="w-16 h-16" />
               </button>
               <div className="flex items-center gap-14">
                  {windows.filter(w => w.isOpen).map(w => (
                    <button key={w.id} onClick={() => focusWindow(w.id)} className={`w-32 h-32 flex items-center justify-center rounded-[44px] transition-all relative ${!w.isMinimized ? 'bg-white/10 ring-2 ring-cyan-500/40 scale-110 shadow-[0_0_30px_#06b6d430]' : 'opacity-20 hover:opacity-100'}`}>
                       <div className="scale-[2.4]" style={{ color: currentAccent }}>{APP_ICONS[w.id]}</div>
                    </button>
                  ))}
               </div>
            </div>
            <div className="text-right flex items-center gap-16">
               <div className="text-right">
                  <span className="text-6xl font-black text-white tracking-tighter leading-none">{currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="text-[16px] font-black uppercase text-white/20 tracking-[1em] mt-2 flex items-center justify-end gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> SECURE OS
                  </div>
               </div>
               <div className="w-px h-20 bg-white/10" />
               <Star className="w-12 h-12 text-amber-500 animate-pulse" />
            </div>
         </div>
      </div>
    </div>
  );
};

export default App;
