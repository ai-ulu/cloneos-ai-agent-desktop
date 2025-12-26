
import React from 'react';
import { Brain, Sparkles, Zap } from 'lucide-react';
import { DimensionType } from '../types';

interface NeuralSingularityProps {
  dimension: DimensionType;
  isProcessing: boolean;
  onClick: () => void;
}

const NeuralSingularity: React.FC<NeuralSingularityProps> = ({ dimension, isProcessing, onClick }) => {
  const getColor = () => {
    if (dimension === 'ZENITH') return 'from-pink-500 via-rose-500 to-amber-500';
    if (dimension === 'ETHEREAL') return 'from-purple-600 via-fuchsia-500 to-indigo-600';
    return 'from-cyan-500 via-blue-500 to-emerald-500';
  };

  return (
    <div 
      onClick={onClick}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 cursor-pointer group"
    >
      {/* Background Glow */}
      <div className={`absolute inset-[-150px] bg-gradient-to-r ${getColor()} opacity-20 blur-[120px] rounded-full animate-pulse duration-[5000ms] transition-all`} />
      
      {/* Outer Rings */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className={`absolute inset-0 border border-white/10 rounded-full animate-spin duration-[20s] transition-all ${isProcessing ? 'scale-125 border-cyan-500/40' : 'scale-100'}`} />
        <div className={`absolute inset-8 border border-white/5 rounded-full animate-spin duration-[15s] direction-reverse opacity-30 ${isProcessing ? 'scale-110 border-purple-500/40' : 'scale-100'}`} />
        
        {/* Core Orb */}
        <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getColor()} shadow-[0_0_80px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden group-hover:scale-110 transition-all duration-1000 ${isProcessing ? 'animate-bounce' : 'animate-pulse'}`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <Brain className={`w-14 h-14 text-white drop-shadow-2xl transition-all ${isProcessing ? 'scale-125' : 'scale-100'}`} />
          
          {/* Particles */}
          <Sparkles className="absolute top-4 right-4 w-4 h-4 text-white/40 animate-ping" />
          <Zap className="absolute bottom-4 left-4 w-4 h-4 text-white/40 animate-bounce" />
        </div>

        {/* Status Text */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap flex flex-col items-center gap-2">
          <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.8em] group-hover:text-white group-hover:tracking-[1em] transition-all duration-1000">
            {isProcessing ? 'Neuralizing' : dimension}
          </span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`w-1 h-1 rounded-full ${isProcessing ? 'bg-cyan-500 animate-bounce' : 'bg-white/20'}`} style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralSingularity;
