
import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../services/ai';
import { 
  FileCode, Play, Save, FolderOpen, ChevronRight, 
  Terminal as TermIcon, Search, Layout, FileJson, FileText, Settings,
  Github, Plus, Trash2, GitCommit, GitPullRequest, Sparkles, Loader2,
  Check, ArrowRight, FileType, FileEdit, Beaker, FlaskConical, ClipboardCheck,
  Zap, ShieldCheck, Bug, AlertTriangle, ShieldAlert, Info, Hammer,
  CheckCircle2, XCircle, Timer, Activity, Gauge, RefreshCcw, 
  ChevronDown, ChevronUp, History, FastForward, Wand2, Orbit, Palette, Pipette
} from 'lucide-react';
import { SyntaxTheme } from '../types';

const DEFAULT_SYNTAX_THEME: SyntaxTheme = {
  keyword: '#f472b6',
  string: '#fbbf24',
  comment: '#4b5563',
  number: '#818cf8',
  function: '#22d3ee',
  background: '#09090b',
  text: '#cbd5e1'
};

const getFileIcon = (fileName: string, active: boolean) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const colorClass = active ? 'text-cyan-400' : 'text-slate-500';
  
  switch (ext) {
    case 'py':
      return <FileCode className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-emerald-600/60'}`} />;
    case 'js':
    case 'ts':
      return <FileCode className={`w-4 h-4 ${active ? 'text-yellow-400' : 'text-yellow-600/60'}`} />;
    case 'css':
      return <Layout className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-blue-600/60'}`} />;
    case 'json':
      return <FileJson className={`w-4 h-4 ${active ? 'text-orange-400' : 'text-orange-600/60'}`} />;
    case 'md':
      return <FileText className={`w-4 h-4 ${active ? 'text-slate-200' : 'text-slate-600'}`} />;
    default:
      return <FileText className={`w-4 h-4 ${colorClass}`} />;
  }
};

interface CodeIssue {
  severity: 'high' | 'medium' | 'low';
  type: 'bug' | 'smell' | 'security';
  line?: number;
  description: string;
  fixSuggestion?: string;
}

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration: string;
  error?: string;
}

interface TestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: string;
  };
  results: TestResult[];
}

interface CodeWorkspaceProps {
  files: { name: string; content: string }[];
  setFiles: React.Dispatch<React.SetStateAction<{ name: string; content: string }[]>>;
  patterns: any[];
}

const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ files, setFiles, patterns }) => {
  const [activeFile, setActiveFile] = useState(0);
  const [githubStatus, setGithubStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [suggestion, setSuggestion] = useState<string>('');
  const [testResultCode, setTestResultCode] = useState<string>('');
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [activeTests, setActiveTests] = useState<TestResult[]>([]);
  const [analysisIssues, setAnalysisIssues] = useState<CodeIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isFixing, setIsFixing] = useState<string | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [activeTab, setActiveTab] = useState<'intellisense' | 'tests' | 'analysis' | 'aesthetics'>('intellisense');
  const [syntaxTheme, setSyntaxTheme] = useState<SyntaxTheme>(() => {
    const saved = localStorage.getItem('clone_os_syntax_theme');
    return saved ? JSON.parse(saved) : DEFAULT_SYNTAX_THEME;
  });

  const debounceTimer = useRef<number | null>(null);
  const scanTimer = useRef<number | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('clone_os_syntax_theme', JSON.stringify(syntaxTheme));
  }, [syntaxTheme]);

  useEffect(() => {
    if (activeFile >= files.length) {
      setActiveFile(Math.max(0, files.length - 1));
    }
  }, [files.length]);

  // AI Autocomplete Logic
  useEffect(() => {
    const currentFile = files[activeFile];
    if (!currentFile || !currentFile.content.trim()) {
      setSuggestion('');
      return;
    }
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(async () => {
      setIsAnalyzing(true);
      const result = await aiService.getCodeCompletion(currentFile.name, currentFile.content);
      setSuggestion(result);
      setIsAnalyzing(false);
    }, 1500);
    return () => { if (debounceTimer.current) window.clearTimeout(debounceTimer.current); };
  }, [files, activeFile]);

  // Real-time Code Analysis Logic
  useEffect(() => {
    const currentFile = files[activeFile];
    if (!currentFile || !currentFile.content.trim()) {
      setAnalysisIssues([]);
      return;
    }
    if (scanTimer.current) window.clearTimeout(scanTimer.current);
    scanTimer.current = window.setTimeout(async () => {
      setIsScanning(true);
      const result = await aiService.analyzeCode(currentFile.name, currentFile.content);
      setAnalysisIssues(result.issues || []);
      setIsScanning(false);
    }, 3000);
    return () => { if (scanTimer.current) window.clearTimeout(scanTimer.current); };
  }, [files, activeFile]);

  const addFile = (name?: string, content: string = '') => {
    const fileName = name || prompt('Dosya adı:');
    if(fileName) {
      setFiles(prev => [...prev, { name: fileName, content }]);
      setActiveFile(files.length);
    }
  };

  const deleteFile = (idx: number) => {
    if(files.length > 1 && confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
      const newFiles = files.filter((_, i) => i !== idx);
      setFiles(newFiles);
      setActiveFile(0);
    }
  };

  const syncGithub = () => {
    setGithubStatus('syncing');
    setTimeout(() => setGithubStatus('success'), 2000);
    setTimeout(() => setGithubStatus('idle'), 5000);
  };

  const acceptSuggestion = () => {
    if (!suggestion) return;
    const newFiles = [...files];
    newFiles[activeFile].content += (newFiles[activeFile].content.endsWith('\n') ? '' : '\n') + suggestion;
    setFiles(newFiles);
    setSuggestion('');
  };

  const evolveCode = async () => {
    const currentFile = files[activeFile];
    setIsEvolving(true);
    const evolvedContent = await aiService.evolveCodebase(currentFile.name, currentFile.content, patterns);
    if (evolvedContent) {
      const newFiles = [...files];
      newFiles[activeFile].content = evolvedContent.replace(/```(?:[a-z]*)\n([\s\S]*?)```/, '$1');
      setFiles(newFiles);
    }
    setIsEvolving(false);
  };

  const generateTests = async () => {
    setIsTesting(true);
    setActiveTab('tests');
    const currentFile = files[activeFile];
    const result = await aiService.generateTests(
      `Kod Analizi: ${currentFile.name}`,
      currentFile.content,
      { name: 'Senior QA Agent', specialization: 'debugger' }
    );
    setTestResultCode(result || "Test senaryosu üretilemedi.");
    setTestReport(null);
    setActiveTests([]);
    setIsTesting(false);
  };

  const runTests = async () => {
    if (!testResultCode) return;
    setIsRunningTests(true);
    const currentFile = files[activeFile];
    
    // Get full simulation results
    const report = await aiService.runTestsSimulation(currentFile.content, testResultCode);
    if (!report) {
      setIsRunningTests(false);
      return;
    }

    // Sequence simulation for UI
    setActiveTests(report.results.map(r => ({ ...r, status: 'pending' })));
    setTestReport(null);

    for (let i = 0; i < report.results.length; i++) {
      // Set to running
      setActiveTests(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'running' } : t));
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      
      // Set to actual result
      setActiveTests(prev => prev.map((t, idx) => idx === i ? { ...t, status: report.results[i].status } : t));
    }

    setTestReport(report);
    setIsRunningTests(false);
  };

  const updateThemeColor = (key: keyof SyntaxTheme, color: string) => {
    setSyntaxTheme(prev => ({ ...prev, [key]: color }));
  };

  // Simple Highlight logic for display
  const highlightCode = (code: string) => {
    if (!code) return '';
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped
      .replace(/\b(def|class|if|else|elif|for|while|return|import|from|as|try|except|finally|with|in|is|not|and|or|lambda|async|await|const|let|var|function|export|default)\b/g, `<span style="color: ${syntaxTheme.keyword}">$1</span>`)
      .replace(/(".*?"|'.*?'|`.*?`)/g, `<span style="color: ${syntaxTheme.string}">$1</span>`)
      .replace(/(\/\*[\s\S]*?\*\/|\/\/.*|#.*)/g, `<span style="color: ${syntaxTheme.comment}">$1</span>`)
      .replace(/\b(\d+)\b/g, `<span style="color: ${syntaxTheme.number}">$1</span>`)
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, `<span style="color: ${syntaxTheme.function}">$1</span>`);
  };

  if (!files[activeFile]) return <div className="p-20 text-center opacity-20 uppercase font-black tracking-widest">No active file</div>;

  return (
    <div className="flex h-full bg-[#0d0d0f] text-slate-400 font-mono text-[12px] overflow-hidden" style={{ background: syntaxTheme.background }}>
      {/* Sidebar Toolbelt */}
      <div className="w-14 border-r border-white/5 bg-black/60 flex flex-col items-center py-6 gap-8 shrink-0">
        <FolderOpen className="w-6 h-6 text-cyan-400" />
        <Github onClick={syncGithub} className={`w-6 h-6 cursor-pointer hover:text-white transition-all ${githubStatus === 'syncing' ? 'animate-bounce text-emerald-400' : ''}`} />
        <div className="flex-1" />
        <button onClick={() => setActiveTab('aesthetics')} className="p-3 rounded-xl hover:bg-white/5 text-cyan-500/60 hover:text-cyan-400 transition-all">
           <Palette className="w-6 h-6" />
        </button>
        <button onClick={evolveCode} className={`p-3 rounded-xl transition-all ${isEvolving ? 'bg-purple-600 animate-spin' : 'hover:bg-purple-500/20 text-purple-400'}`}>
           <Orbit className="w-6 h-6" />
        </button>
        <Settings className="w-5 h-5 opacity-40 hover:opacity-100 cursor-pointer" />
      </div>

      {/* File Explorer */}
      <div className="w-64 border-r border-white/5 bg-black/20 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Çalışma Alanı</span>
          <Plus onClick={() => addFile()} className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        </div>
        <div className="p-3 space-y-1 overflow-y-auto custom-scrollbar text-[11px]">
          {files.map((file, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveFile(idx)}
              className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${activeFile === idx ? 'bg-cyan-500/10 text-white border border-cyan-500/20 shadow-xl' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3 truncate">
                {getFileIcon(file.name, activeFile === idx)}
                <span className="truncate font-bold tracking-tight">{file.name}</span>
              </div>
              <Trash2 onClick={(e) => { e.stopPropagation(); deleteFile(idx); }} className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 hover:text-rose-500 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col relative">
        <div className="h-12 border-b border-white/5 flex items-center px-6 bg-zinc-950/40 gap-6 shrink-0">
           <div className="flex items-center gap-3 text-white">
              <div className="p-1.5 bg-white/5 rounded-lg">
                {getFileIcon(files[activeFile].name, true)}
              </div>
              <span className="text-xs font-black text-cyan-400 tracking-tight">{files[activeFile].name}</span>
           </div>
           <div className="flex-1" />
           <div className="flex items-center gap-2">
              <button onClick={generateTests} className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-[10px] font-black uppercase transition-all border border-blue-500/20">
                <Beaker className="w-3.5 h-3.5" /> Tests
              </button>
              <button onClick={runTests} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
                <Play className="w-3.5 h-3.5 fill-current" /> Run
              </button>
           </div>
        </div>

        <div className="flex-1 flex relative overflow-hidden" style={{ background: syntaxTheme.background }}>
          <div className="flex-1 relative">
            {/* Highlighter Layer */}
            <div 
              ref={highlightRef}
              className="absolute inset-0 p-10 pointer-events-none whitespace-pre-wrap break-words leading-loose text-[13px] font-mono overflow-hidden"
              dangerouslySetInnerHTML={{ __html: highlightCode(files[activeFile].content) }}
            />
            {/* Interactive Layer */}
            <textarea 
              value={files[activeFile].content}
              onChange={(e) => {
                const newFiles = [...files];
                newFiles[activeFile].content = e.target.value;
                setFiles(newFiles);
              }}
              onScroll={(e) => {
                if (highlightRef.current) highlightRef.current.scrollTop = e.currentTarget.scrollTop;
              }}
              spellCheck={false}
              style={{ color: 'transparent', caretColor: syntaxTheme.text }}
              className="absolute inset-0 bg-transparent p-10 outline-none leading-loose resize-none custom-scrollbar text-[13px] border-none font-mono w-full h-full"
            />
          </div>

          {/* AI Side Panel */}
          <div className="w-[500px] border-l border-white/5 bg-black/40 backdrop-blur-md flex flex-col overflow-hidden shadow-2xl">
            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-zinc-950/40 shrink-0">
              <button onClick={() => setActiveTab('intellisense')} className={`flex-1 p-4 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'intellisense' ? 'text-cyan-400 bg-cyan-500/5 border-b-2 border-cyan-500' : 'text-slate-600 hover:text-slate-400'}`}>IntelliSense</button>
              <button onClick={() => setActiveTab('analysis')} className={`flex-1 p-4 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'analysis' ? 'text-rose-400 bg-rose-500/5 border-b-2 border-rose-500' : 'text-slate-600 hover:text-slate-400'}`}>Analysis</button>
              <button onClick={() => setActiveTab('tests')} className={`flex-1 p-4 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'tests' ? 'text-blue-400 bg-blue-500/5 border-b-2 border-blue-500' : 'text-slate-600 hover:text-slate-400'}`}>Test Lab</button>
              <button onClick={() => setActiveTab('aesthetics')} className={`flex-1 p-4 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'aesthetics' ? 'text-amber-400 bg-amber-500/5 border-b-2 border-amber-500' : 'text-slate-600 hover:text-slate-400'}`}>Aesthetics</button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {activeTab === 'intellisense' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'text-cyan-400 animate-spin' : 'text-purple-400'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Completion</span>
                    </div>
                  </div>
                  {suggestion ? (
                    <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
                        <pre className="text-[11px] leading-relaxed text-cyan-100/80 font-mono whitespace-pre-wrap italic">{suggestion}</pre>
                      </div>
                      <button onClick={acceptSuggestion} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 transition-all active:scale-95">
                        Uygula <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center opacity-20 text-center gap-4 py-20">
                      <Sparkles className="w-8 h-8" />
                      <p className="text-[9px] font-bold leading-relaxed uppercase tracking-widest px-4">Standby.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  {analysisIssues.map((issue, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border bg-black/40 animate-in fade-in slide-in-from-right-4 duration-500 ${issue.severity === 'high' ? 'border-rose-500/30' : 'border-white/5'}`}>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{issue.severity} • {issue.type}</span>
                      <p className="text-[11px] leading-relaxed text-slate-300 mt-2">{issue.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-6">
                  {activeTests.map((res, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-white/5 bg-zinc-950/20 flex items-center justify-between">
                       <span className="text-[11px] font-black">{res.name}</span>
                       <span className={`text-[9px] uppercase font-black ${res.status === 'passed' ? 'text-emerald-500' : 'text-rose-500'}`}>{res.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'aesthetics' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <header className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Theme Studio</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Workspace görünümünü özelleştir.</p>
                  </header>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(syntaxTheme).map(([key, value]) => (
                      <div key={key} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                           <Pipette className="w-3 h-3" /> {key}
                        </label>
                        <div className="flex items-center gap-3">
                           <input 
                             type="color" 
                             value={value} 
                             onChange={(e) => updateThemeColor(key as keyof SyntaxTheme, e.target.value)}
                             className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
                           />
                           <input 
                             type="text" 
                             value={value} 
                             onChange={(e) => updateThemeColor(key as keyof SyntaxTheme, e.target.value)}
                             className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none font-mono"
                           />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setSyntaxTheme(DEFAULT_SYNTAX_THEME)}
                    className="w-full bg-white/5 hover:bg-white/10 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase border border-white/5 transition-all"
                  >
                    Varsayılana Dön
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Status Bar */}
        <div className="h-8 border-t border-white/5 bg-zinc-950 flex items-center justify-between px-6 text-[9px] font-bold uppercase tracking-widest shrink-0">
           <div className="flex items-center gap-4">
              <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Local Workspace</span>
              <span className="text-slate-500">LOC: {files[activeFile].content.split('\n').length}</span>
           </div>
           <div className="flex items-center gap-4 text-slate-600">
              {isEvolving ? 'Evolution in progress...' : 'Ready'}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CodeWorkspace;
