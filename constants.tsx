
import React from 'react';
import { 
  UserCircle, MessageSquare, Mic, Settings, Terminal as TerminalIcon, 
  Cpu, Globe, Briefcase, Activity, Database, Code, Share2, Cloud,
  Share, Zap, Brain, HelpCircle, UserCheck, Languages
} from 'lucide-react';
import { AppTheme } from './types';

export const APP_ICONS: Record<string, React.ReactNode> = {
  config: <UserCircle className="w-6 h-6" />,
  chat: <MessageSquare className="w-6 h-6" />,
  live: <Mic className="w-6 h-6" />,
  settings: <Settings className="w-6 h-6" />,
  terminal: <TerminalIcon className="w-6 h-6" />,
  agent: <Activity className="w-6 h-6" />,
  vault: <Database className="w-6 h-6" />,
  code: <Code className="w-6 h-6" />,
  social: <Share2 className="w-6 h-6" />,
  deploy: <Cloud className="w-6 h-6" />,
  swarm: <Share className="w-6 h-6" />,
  learning: <Brain className="w-6 h-6" />,
  help: <HelpCircle className="w-6 h-6" />,
  interview: <UserCheck className="w-6 h-6" />,
  interpreter: <Languages className="w-6 h-6" />
};

export const INITIAL_WINDOWS = [
  { id: 'help', title: 'Nasıl Kullanılır?' },
  { id: 'chat', title: 'Klon Sohbeti' },
  { id: 'interpreter', title: 'Toplantı Tercümanı' },
  { id: 'agent', title: 'Komuta Merkezi' },
  { id: 'live', title: 'Sesli Asistan' },
  { id: 'interview', title: 'Mülakat Koçu (Pro)' },
  { id: 'code', title: 'Geliştirme Ortamı' },
  { id: 'vault', title: 'Bilgi Bankası' },
  { id: 'social', title: 'Sosyal Medya' },
  { id: 'config', title: 'Klon Yapılandırması' }
];

export const DEFAULT_CLONE_PROFILE = {
  name: "Neo-Klon",
  personality: "Analitik, stratejik ve otonom yazılım mühendisi.",
  background: "Full-stack geliştirme, sosyal medya algoritmaları ve bulut sistemleri uzmanı.",
  speakingStyle: "Teknik, net ve aksiyon odaklı.",
  hobbies: ["Yapay Zeka Mimarisi", "Otonom Sistemler", "Algoritmik Ticaret"]
};

export const THEMES: AppTheme[] = [
  {
    id: 'nebula',
    name: 'Sonoma Glass (macOS)',
    background: 'linear-gradient(135deg, #2e1065 0%, #020617 100%)',
    accent: '#06b6d4',
    taskbar: 'bg-white/10 backdrop-blur-3xl',
    windowBg: 'bg-slate-950/40 backdrop-blur-[80px]',
    borderRadius: '32px',
    fontFamily: "'Space Grotesk', sans-serif",
    glassBlur: 'backdrop-blur-3xl'
  },
  {
    id: 'fluent',
    name: 'Fluent Aurora (Windows 11)',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)',
    accent: '#60a5fa',
    taskbar: 'bg-slate-900/60 backdrop-blur-2xl',
    windowBg: 'bg-[#1c1c1c]/80 backdrop-blur-2xl',
    borderRadius: '12px',
    fontFamily: "'Space Grotesk', sans-serif",
    glassBlur: 'backdrop-blur-xl'
  },
  {
    id: 'cyber',
    name: 'Matrix Void (Cyber)',
    background: 'linear-gradient(180deg, #000000 0%, #050505 100%)',
    accent: '#39ff14',
    taskbar: 'bg-black/80 border-t border-[#39ff14]/20',
    windowBg: 'bg-black/90 border border-[#39ff14]/30',
    borderRadius: '4px',
    fontFamily: "'JetBrains Mono', monospace",
    glassBlur: 'backdrop-blur-none'
  },
  {
    id: 'deep-space',
    name: 'Deep Space (Minimal)',
    background: '#020203',
    accent: '#f43f5e',
    taskbar: 'bg-zinc-950/40 backdrop-blur-md',
    windowBg: 'bg-zinc-950/90 backdrop-blur-md',
    borderRadius: '56px',
    fontFamily: "'Space Grotesk', sans-serif",
    glassBlur: 'backdrop-blur-lg'
  }
];
