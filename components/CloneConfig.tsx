
import React, { useState, useEffect, useCallback } from 'react';
import { Save, User, FileText, Zap, Music, Wand2, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { CloneProfile } from '../types';
import { aiService } from '../services/ai';

interface CloneConfigProps {
  profile: CloneProfile;
  onSave: (profile: CloneProfile) => void;
}

const CloneConfig: React.FC<CloneConfigProps> = ({ profile, onSave }) => {
  const [localProfile, setLocalProfile] = useState(profile);
  const [hobbyInput, setHobbyInput] = useState('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const addHobby = () => {
    if (hobbyInput.trim()) {
      setLocalProfile(prev => ({ ...prev, hobbies: [...prev.hobbies, hobbyInput.trim()] }));
      setHobbyInput('');
    }
  };

  const handleSave = useCallback(() => {
    onSave(localProfile);
  }, [onSave, localProfile]);

  const generateNeuralAvatar = async () => {
    setIsGeneratingAvatar(true);
    try {
      const ai = aiService.getClient();
      // Step 1: Generate Visual Prompt based on Personality
      const promptResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Profil: ${JSON.stringify(localProfile)}. 
        Bu klonun karakterini, arka planını ve tarzını temsil eden sanatsal bir avatar için İngilizce, detaylı ve yüksek kaliteli bir Image Generation Promptu oluştur. 
        Minimalist, futuristik ve etkileyici olsun. Sadece prompt metnini döndür.`,
      });
      
      const visualPrompt = promptResponse.text;
      
      // Step 2: Generate Image
      const imageUrl = await aiService.generateImage(`Futuristic high-tech neural portrait avatar of ${localProfile.name}: ${visualPrompt}. 4k, cinematic lighting, synthwave minimalist style.`);
      
      if (imageUrl) {
        setLocalProfile(prev => ({ ...prev, avatar: imageUrl }));
      }
    } catch (error) {
      console.error("Avatar generation failed:", error);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className="h-full bg-slate-900 p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <header className="space-y-4">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <Zap className="w-8 h-8 text-cyan-400" />
            Neural Kimlik Paneli
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
            Klonunun sinaptik yapısını ve görsel kimliğini buradan yönetebilirsin. Değişiklikler tüm otonom ajanların davranışlarını etkiler.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
           {/* Left: Avatar Section */}
           <div className="w-full lg:w-1/3 flex flex-col items-center gap-8">
              <div className="relative group">
                 <div className={`w-64 h-64 rounded-[60px] border-2 border-dashed border-white/10 flex items-center justify-center bg-black/40 overflow-hidden transition-all duration-700 ${localProfile.avatar ? 'border-cyan-500/40 shadow-[0_0_80px_rgba(6,182,212,0.2)]' : ''}`}>
                    {isGeneratingAvatar ? (
                       <div className="flex flex-col items-center gap-4 animate-pulse">
                          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                          <span className="text-[9px] font-black uppercase text-cyan-500 tracking-widest">Neuralizing Identity...</span>
                       </div>
                    ) : localProfile.avatar ? (
                       <img src={localProfile.avatar} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    ) : (
                       <div className="text-center space-y-3 opacity-20 group-hover:opacity-60 transition-opacity">
                          <User className="w-20 h-20 mx-auto" />
                          <span className="text-[10px] font-black uppercase tracking-widest block">No Visual Sync</span>
                       </div>
                    )}
                 </div>
                 {localProfile.avatar && (
                   <div className="absolute -top-3 -right-3 bg-cyan-500 p-3 rounded-2xl shadow-2xl animate-bounce">
                      <Sparkles className="w-4 h-4 text-white" />
                   </div>
                 )}
              </div>
              
              <button 
                onClick={generateNeuralAvatar}
                disabled={isGeneratingAvatar}
                className="w-full bg-white/5 hover:bg-white/10 text-white p-5 rounded-[32px] font-black text-[10px] uppercase border border-white/5 transition-all flex items-center justify-center gap-3 active:scale-95 group shadow-2xl"
              >
                 {isGeneratingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />}
                 {localProfile.avatar ? 'Avatarı Neural Olarak Yenile' : 'Neural Avatar Oluştur'}
              </button>
           </div>

           {/* Right: Info Section */}
           <div className="flex-1 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                    <User className="w-4 h-4 text-cyan-500" /> Klon Kimliği
                  </label>
                  <input 
                    type="text" 
                    value={localProfile.name}
                    onChange={e => setLocalProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-black border border-white/5 rounded-[24px] p-5 text-white focus:border-cyan-500/40 outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                    <Music className="w-4 h-4 text-purple-500" /> Synapse Dialect
                  </label>
                  <input 
                    type="text" 
                    value={localProfile.speakingStyle}
                    onChange={e => setLocalProfile(p => ({ ...p, speakingStyle: e.target.value }))}
                    placeholder="Örn: Stoik, teknik, esprili..."
                    className="w-full bg-black border border-white/5 rounded-[24px] p-5 text-white focus:border-cyan-500/40 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                  <FileText className="text-emerald-500 w-4 h-4" /> Bilişsel Matris (Kişilik)
                </label>
                <textarea 
                  rows={3}
                  value={localProfile.personality}
                  onChange={e => setLocalProfile(p => ({ ...p, personality: e.target.value }))}
                  className="w-full bg-black border border-white/5 rounded-[32px] p-6 text-white focus:border-cyan-500/40 outline-none resize-none transition-all leading-relaxed"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                  <Zap className="text-amber-500 w-4 h-4" /> Deneyim Katmanları (Background)
                </label>
                <textarea 
                  rows={4}
                  value={localProfile.background}
                  onChange={e => setLocalProfile(p => ({ ...p, background: e.target.value }))}
                  placeholder="Klonunun uzmanlık alanları ve dijital geçmişi..."
                  className="w-full bg-black border border-white/5 rounded-[32px] p-6 text-white focus:border-cyan-500/40 outline-none resize-none transition-all leading-relaxed"
                />
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">İlgi Alanları & Modüller</label>
                <div className="flex flex-wrap gap-3">
                  {localProfile.hobbies.map((h, i) => (
                    <span key={i} className="bg-cyan-500/5 text-cyan-400 border border-cyan-500/20 px-5 py-2.5 rounded-full text-[11px] font-bold flex items-center gap-3 group/tag">
                      {h}
                      <button 
                        onClick={() => setLocalProfile(p => ({ ...p, hobbies: p.hobbies.filter((_, idx) => idx !== i) }))}
                        className="opacity-40 hover:opacity-100 hover:text-rose-500 transition-all"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={hobbyInput}
                    onChange={e => setHobbyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addHobby()}
                    placeholder="Yeni modül ekle..."
                    className="flex-1 bg-white/5 border border-white/5 rounded-[20px] p-4 text-xs text-white focus:border-cyan-500/30 outline-none transition-all"
                  />
                  <button onClick={addHobby} className="bg-slate-800 hover:bg-slate-700 px-8 rounded-[20px] text-[10px] font-black uppercase text-white transition-all active:scale-95">Ekle</button>
                </div>
              </div>
           </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex justify-end">
          <button 
            onClick={handleSave}
            title="Ctrl + S"
            className="flex items-center gap-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-5 px-12 rounded-[32px] transition-all shadow-[0_20px_50px_rgba(8,145,178,0.3)] active:scale-95 text-xs uppercase"
          >
            <Save className="w-5 h-5" />
            Klonu Neural Ağa Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

// Exporting CloneConfig as default export to fix App.tsx error
export default CloneConfig;
