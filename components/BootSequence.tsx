
import React, { useState, useEffect } from 'react';
import { Brain, Cpu, ShieldCheck, Globe, Zap, Loader2 } from 'lucide-react';

const BOOT_STEPS = [
  { icon: <Cpu className="w-4 h-4" />, text: "Neural Kernel Initializing...", duration: 800 },
  { icon: <ShieldCheck className="w-4 h-4" />, text: "Security Protocols Loading...", duration: 600 },
  { icon: <Globe className="w-4 h-4" />, text: "Global Mesh Syncing...", duration: 1000 },
  { icon: <Zap className="w-4 h-4" />, text: "Energy Core Calibrating...", duration: 500 },
  { icon: <Brain className="w-4 h-4" />, text: "Clone Synapse Link Established.", duration: 400 },
];

const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep < BOOT_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, BOOT_STEPS[currentStep].duration);
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 500);
    }
  }, [currentStep, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / (BOOT_STEPS.length * 10)), 100));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[3000000] bg-[#020617] flex flex-col items-center justify-center font-mono p-10">
      <div className="relative w-64 h-64 mb-16">
        <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute inset-0 border-2 border-cyan-500/10 rounded-full animate-spin duration-[10s]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-24 h-24 text-cyan-400 animate-pulse" />
        </div>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-500 shadow-[0_0_20px_#06b6d4] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3 min-h-[100px]">
          {BOOT_STEPS.slice(0, currentStep + 1).map((step, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-4 text-[11px] uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                i === currentStep ? 'text-white' : 'text-slate-500'
              }`}
            >
              <div className={i === currentStep ? 'text-cyan-400' : 'text-slate-700'}>
                {i === currentStep ? <Loader2 className="w-4 h-4 animate-spin" /> : step.icon}
              </div>
              <span className="font-black">{step.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-16 text-[10px] font-black text-slate-800 uppercase tracking-[1em]">
        CloneOS v1.0 • Neo-Genesis
      </div>
    </div>
  );
};

export default BootSequence;
