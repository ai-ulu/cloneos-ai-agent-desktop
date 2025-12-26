
import React from 'react';
import { DimensionType } from '../types';
import { Box, Zap, Brain, Sparkles } from 'lucide-react';

interface DimensionalNexusProps {
  current: DimensionType;
  onShift: (type: DimensionType) => void;
}

const DimensionalNexus: React.FC<DimensionalNexusProps> = ({ current, onShift }) => {
  return (
    <div className="flex bg-white/5 backdrop-blur-3xl p-1.5 rounded-[32px] border border-white/10 shadow-2xl">
      <button 
        onClick={() => onShift('MATERIAL')}
        className={`flex items-center gap-3 px-6 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-700 ${
          current === 'MATERIAL' ? 'bg-cyan-600 text-white shadow-[0_0_20px_#06b6d4]' : 'text-slate-500 hover:text-white hover:bg-white/5'
        }`}
      >
        <Box className="w-4 h-4" /> Material
      </button>
      
      <button 
        onClick={() => onShift('ZENITH')}
        className={`flex items-center gap-3 px-6 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-700 ${
          current === 'ZENITH' ? 'bg-pink-600 text-white shadow-[0_0_20px_#db2777]' : 'text-slate-500 hover:text-white hover:bg-white/5'
        }`}
      >
        <Zap className="w-4 h-4" /> Zenith
      </button>

      <button 
        onClick={() => onShift('ETHEREAL')}
        className={`flex items-center gap-3 px-6 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-700 ${
          current === 'ETHEREAL' ? 'bg-purple-600 text-white shadow-[0_0_20px_#9333ea]' : 'text-slate-500 hover:text-white hover:bg-white/5'
        }`}
      >
        <Brain className="w-4 h-4" /> Ethereal
      </button>
    </div>
  );
};

export default DimensionalNexus;
