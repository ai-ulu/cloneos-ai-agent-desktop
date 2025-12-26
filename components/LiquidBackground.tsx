
import React from 'react';

interface LiquidBackgroundProps {
  color: string;
}

const LiquidBackground: React.FC<LiquidBackgroundProps> = ({ color }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
       {/* Blobs */}
       <div 
         className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] blur-[120px] rounded-full opacity-20 animate-pulse transition-colors duration-[3000ms]"
         style={{ background: color, animationDuration: '8s' }}
       />
       <div 
         className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] blur-[150px] rounded-full opacity-10 animate-bounce transition-colors duration-[4000ms]"
         style={{ background: color, animationDuration: '12s' }}
       />
       <div 
         className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] blur-[100px] rounded-full opacity-15 animate-pulse transition-colors duration-[5000ms]"
         style={{ background: color, animationDuration: '10s' }}
       />
       
       {/* Matrix Overlay */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay" />
    </div>
  );
};

export default LiquidBackground;
