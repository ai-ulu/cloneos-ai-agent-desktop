
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { Mic, MicOff, Languages, Volume2, VolumeX, Trash2, History, Loader2, Sparkles, Globe, ArrowRightLeft, Quote } from 'lucide-react';
import { decode, decodeAudioData, createBlob } from '../services/audioUtils';
import { CloneProfile } from '../types';

interface TranslationEntry {
  original: string;
  translated: string;
  timestamp: Date;
}

const InterpreterApp: React.FC<{ profile: CloneProfile }> = ({ profile }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAudioOutputEnabled, setIsAudioOutputEnabled] = useState(true);
  const [history, setHistory] = useState<TranslationEntry[]>([]);
  const [currentOriginal, setCurrentOriginal] = useState('');
  const [currentTranslated, setCurrentTranslated] = useState('');
  const [targetLang, setTargetLang] = useState('Türkçe');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, currentOriginal, currentTranslated]);

  const stopSession = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    if (sessionRef.current) sessionRef.current.close?.();
    sessionRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    nextStartTimeRef.current = 0;
  }, []);

  const startSession = async () => {
    try {
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx; outputAudioContextRef.current = outputCtx;
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = micStream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true); setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(micStream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (!isActive) return;
              sessionPromise.then(session => session.sendRealtimeInput({ media: createBlob(e.inputBuffer.getChannelData(0)) }));
            };
            source.connect(scriptProcessor); scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Canlı çeviri transkripti
            if (message.serverContent?.outputTranscription) {
              setCurrentTranslated(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.inputTranscription) {
              setCurrentOriginal(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setHistory(prev => [...prev, { 
                original: currentOriginal, 
                translated: currentTranslated, 
                timestamp: new Date() 
              }]);
              setCurrentOriginal(''); setCurrentTranslated('');
            }

            // Sesli çeviri (TTS)
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && isAudioOutputEnabled && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer; source.connect(ctx.destination);
              source.start(nextStartTimeRef.current); nextStartTimeRef.current += buffer.duration;
            }
          },
          onerror: () => stopSession(),
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `Sen profesyonel bir eş zamanlı tercümansın. 
          GÖREVİN: Duyduğun her şeyi anında ${targetLang} diline çevirmek. 
          Sadece çeviriyi söyle veya yaz. Kendi yorumunu ekleme. 
          Toplantı bağlamını koru ve teknik terimleri doğru çevir.`,
          outputAudioTranscription: {}, inputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { setIsConnecting(false); }
  };

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-300 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-white/5 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
            <Languages className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">AI Interpreter</h2>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Real-time Translation Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Globe className="w-4 h-4 text-slate-500" />
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              disabled={isActive}
              className="bg-transparent text-[10px] font-black uppercase text-white outline-none cursor-pointer"
            >
              <option value="Türkçe">Hedef: Türkçe</option>
              <option value="İngilizce">Hedef: İngilizce</option>
              <option value="Almanca">Hedef: Almanca</option>
              <option value="Fransızca">Hedef: Fransızca</option>
            </select>
          </div>
          <button 
            onClick={() => setIsAudioOutputEnabled(!isAudioOutputEnabled)}
            className={`p-3 rounded-xl transition-all border ${isAudioOutputEnabled ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
          >
            {isAudioOutputEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button onClick={() => setHistory([])} className="p-3 hover:bg-rose-500/10 rounded-xl text-slate-700 hover:text-rose-500 transition-all">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
          {history.length === 0 && !currentOriginal && !currentTranslated && (
            <div className="h-full flex flex-col items-center justify-center opacity-10 gap-8 grayscale">
              <Sparkles className="w-32 h-32" />
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-[0.4em]">Listening Mode Standby</h3>
                 <p className="text-xs font-bold uppercase tracking-widest">Toplantıyı başlatmak için Connect butonuna bas.</p>
              </div>
            </div>
          )}

          {history.map((entry, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-4">
              <div className="flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                   <Quote className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 space-y-4">
                   <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] text-sm text-slate-400 italic">
                      {entry.original}
                   </div>
                   <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[40px] text-lg text-white font-medium leading-relaxed shadow-2xl">
                      <div className="flex items-center gap-3 mb-2">
                         <Sparkles className="w-4 h-4 text-indigo-400" />
                         <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Çeviri ({targetLang})</span>
                      </div>
                      {entry.translated}
                   </div>
                </div>
              </div>
            </div>
          ))}

          {/* Real-time Streaming View */}
          {(currentOriginal || currentTranslated) && (
            <div className="animate-pulse space-y-4">
               {currentOriginal && (
                 <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] text-sm text-slate-500 italic ml-16">
                    {currentOriginal}...
                 </div>
               )}
               {currentTranslated && (
                 <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[40px] text-lg text-indigo-200/60 font-medium ml-16">
                    {currentTranslated}...
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="w-96 border-l border-white/5 bg-slate-950/40 p-10 flex flex-col justify-between">
           <div className="space-y-10">
              <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[40px] space-y-4">
                 <div className="flex items-center gap-3 text-indigo-400">
                    <History className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Session Stats</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                       <span className="text-[8px] font-black text-slate-600 uppercase">Segments</span>
                       <div className="text-xl font-black text-white">{history.length}</div>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[8px] font-black text-slate-600 uppercase">Target</span>
                       <div className="text-xl font-black text-indigo-400">{targetLang.slice(0, 2)}</div>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Interpreter Guidance</h4>
                 <div className="space-y-2">
                    {[
                      "Canlı dinleme aktifleştiğinde karşı tarafın konuşmasını bekle.",
                      "Çeviri, konuşma bittiğinde transkript hafızasına alınır.",
                      "Sesli çıkış açıksa, çeviri kulağına fısıldanır."
                    ].map((tip, i) => (
                      <div key={i} className="flex gap-3 text-[10px] text-slate-600 leading-relaxed p-2">
                         <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                         {tip}
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              {isActive && (
                <div className="flex items-center justify-center gap-2 mb-4 animate-bounce">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                   <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-2">Listening...</span>
                </div>
              )}
              <button
                onClick={isActive ? stopSession : startSession}
                disabled={isConnecting}
                className={`w-full py-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-4 ${
                  isActive ? 'bg-rose-600 text-white shadow-2xl shadow-rose-900/40' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40'
                }`}
              >
                {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : isActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {isActive ? 'Disconnect' : 'Start Translation'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InterpreterApp;
