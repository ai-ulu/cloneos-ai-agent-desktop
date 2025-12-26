
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { Mic, MicOff, Volume2, Info, AlertCircle, MessageSquare, Trash2, History, Camera, Eye, EyeOff, Loader2, Command, Zap, Activity, Waves, Bot, Quote, Gauge, TrendingUp, Sparkles, UserCheck } from 'lucide-react';
import { decode, decodeAudioData, createBlob } from '../services/audioUtils';
import { aiService, controlOSFunctionDeclaration } from '../services/ai';
import { CloneProfile, SentimentData } from '../types';

interface LiveVoiceAppProps {
  profile: CloneProfile;
  onOSAction?: (action: any) => void;
}

interface TranscriptEntry {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
}

const FRAME_RATE = 1;
const JPEG_QUALITY = 0.5;

const LiveVoiceApp: React.FC<LiveVoiceAppProps> = ({ profile, onOSAction }) => {
  const [isActive, setIsActive] = useState(false);
  const [isVisionEnabled, setIsVisionEnabled] = useState(false);
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState<string>('');
  const [currentUserTranscription, setCurrentUserTranscription] = useState<string>('');
  const [history, setHistory] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [neuralPrompts, setNeuralPrompts] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData>({ score: 50, label: 'neutral', trend: 'stable' });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentTranscription, currentUserTranscription]);

  // Interview Analysis Effect
  useEffect(() => {
    if (isInterviewMode && currentTranscription.length > 50) {
      const analyze = async () => {
        const sentimentResult = await aiService.analyzeMeetingSentiment(currentTranscription);
        setSentiment(sentimentResult);
        const prompts = await aiService.getNeuralPrompts(currentTranscription, "Bu iş görüşmesini kazanmamı sağla.");
        setNeuralPrompts(prompts);
      };
      const timer = setTimeout(analyze, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentTranscription, isInterviewMode]);

  const stopSession = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    if (sessionRef.current) sessionRef.current.close?.();
    sessionRef.current = null;
    if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (videoStreamRef.current) videoStreamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    sourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const toggleVision = async () => {
    if (isVisionEnabled) {
      if (videoStreamRef.current) videoStreamRef.current.getTracks().forEach(t => t.stop());
      setIsVisionEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsVisionEnabled(true);
        if (isActive) initiateVisionStreaming();
      } catch (e) { setError("Kamera erişimi reddedildi."); }
    }
  };

  const initiateVisionStreaming = () => {
    if (sessionRef.current && canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = window.setInterval(() => {
        if (!ctx || !videoRef.current) return;
        canvasRef.current!.width = 320; canvasRef.current!.height = 240;
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        const base64Data = canvasRef.current!.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1];
        sessionRef.current?.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
      }, 1000 / FRAME_RATE);
    }
  };

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
            if (isVisionEnabled) initiateVisionStreaming();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'controlOS') {
                  if (onOSAction) onOSAction(fc.args);
                  sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } } }));
                }
              }
            }
            if (message.serverContent?.outputTranscription) setCurrentTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            if (message.serverContent?.inputTranscription) setCurrentUserTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            if (message.serverContent?.turnComplete) {
              setHistory(prev => [...prev, { role: 'user', text: currentUserTranscription, timestamp: new Date() }, { role: 'model', text: currentTranscription, timestamp: new Date() }]);
              setCurrentTranscription(''); setCurrentUserTranscription('');
            }
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer; source.connect(ctx.destination);
              source.start(nextStartTimeRef.current); nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: (e) => { stopSession(); },
          onclose: () => { stopSession(); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          tools: [{ functionDeclarations: [controlOSFunctionDeclaration] }],
          systemInstruction: `Sen mülakat ve toplantı uzmanı ${profile.name}'sin.`,
          outputAudioTranscription: {}, inputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { setIsConnecting(false); }
  };

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-300 font-sans overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Control Panel */}
        <div className="w-1/2 flex flex-col border-r border-white/5 bg-slate-950/50 p-12 space-y-12">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-2xl">
                   <Waves className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Neural Session</h2>
             </div>
             <button 
                onClick={() => setIsInterviewMode(!isInterviewMode)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${
                  isInterviewMode ? 'bg-purple-600 text-white shadow-xl shadow-purple-900/40' : 'bg-white/5 text-slate-500 hover:text-white'
                }`}
             >
                <UserCheck className="w-4 h-4" /> {isInterviewMode ? 'Interview Mode On' : 'Enter Interview Mode'}
             </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative">
            {isVisionEnabled ? (
              <div className="w-full h-full max-h-[400px] rounded-[48px] overflow-hidden border border-cyan-500/30 relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay" />
              </div>
            ) : (
              <div className={`w-64 h-64 rounded-[64px] flex items-center justify-center border-2 transition-all duration-1000 ${
                isActive ? 'border-cyan-500 shadow-[0_0_80px_#06b6d440] scale-105' : 'border-slate-800 scale-100'
              }`}>
                 <Zap className={`w-24 h-24 ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-800'}`} />
              </div>
            )}

            {isInterviewMode && (
              <div className="absolute bottom-[-20px] left-0 right-0 animate-in fade-in slide-in-from-bottom-4">
                 <div className="bg-black/80 backdrop-blur-3xl border border-purple-500/20 p-8 rounded-[40px] shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Neural Prompter (Suflör)
                       </span>
                       <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase ${
                            sentiment.label === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 
                            sentiment.label === 'skeptical' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                             Interviewer: {sentiment.label}
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3">
                       {neuralPrompts.length > 0 ? neuralPrompts.map((p, i) => (
                         <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 animate-in slide-in-from-left-2" style={{ animationDelay: `${i*100}ms` }}>
                            <Quote className="w-4 h-4 text-cyan-500 shrink-0 mt-1" />
                            <p className="text-sm text-slate-200 font-medium italic">"{p}"</p>
                         </div>
                       )) : (
                         <p className="text-[10px] text-slate-500 italic text-center py-4 uppercase tracking-widest">Görüşme akışı analiz ediliyor...</p>
                       )}
                    </div>
                 </div>
              </div>
            )}
          </div>

          <div className="flex gap-6 w-full max-w-lg mx-auto">
            <button
              onClick={isActive ? stopSession : startSession}
              disabled={isConnecting}
              className={`flex-1 py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-4 ${
                isActive ? 'bg-rose-600 text-white' : 'bg-cyan-600 text-white'
              }`}
            >
              {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : isActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isActive ? 'Stop' : 'Connect'}
            </button>
            <button onClick={toggleVision} className="p-6 bg-white/5 border border-white/10 rounded-3xl text-slate-400 hover:text-white transition-all">
              {isVisionEnabled ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Right Event Stream */}
        <div className="flex-1 flex flex-col bg-slate-950/20 relative">
          <div className="p-8 border-b border-white/5 bg-slate-950/60 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <History className="w-5 h-5 text-slate-500" />
                <span className="text-xs font-black uppercase text-white tracking-widest">Event Stream</span>
             </div>
             <button onClick={() => setHistory([])} className="p-3 hover:bg-rose-500/10 rounded-xl text-slate-700 hover:text-rose-500 transition-all">
               <Trash2 className="w-5 h-5" />
             </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar">
            {history.map((entry, i) => (
              <div key={i} className={`flex flex-col ${entry.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                 <div className={`p-6 rounded-[32px] text-sm leading-relaxed ${
                   entry.role === 'user' ? 'bg-white/5 text-slate-300 rounded-tr-none' : 'bg-cyan-500/10 text-cyan-50 rounded-tl-none border border-cyan-500/20'
                 }`}>
                    {entry.text}
                 </div>
              </div>
            ))}
            {(currentUserTranscription || currentTranscription) && (
              <div className="space-y-4">
                 {currentUserTranscription && <div className="text-right text-[10px] text-slate-500 uppercase italic">Operator: {currentUserTranscription}</div>}
                 {currentTranscription && <div className="text-left text-[10px] text-cyan-500 uppercase italic">Clone: {currentTranscription}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceApp;
