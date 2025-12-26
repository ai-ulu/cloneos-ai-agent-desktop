
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { ChatMessage, CloneProfile } from '../types';

interface ChatAppProps {
  profile: CloneProfile;
}

const ChatApp: React.FC<ChatAppProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('clone_os_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error("Critical: Failed to restore chat history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('clone_os_chat_history', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (retryInput?: string) => {
    const textToSend = retryInput || input;
    if (!textToSend.trim() || isLoading) return;

    if (!retryInput) {
      const userMessage: ChatMessage = {
        role: 'user',
        text: textToSend,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }
    
    setIsLoading(true);
    setErrorStatus(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Implementing a local simple retry for the chat specifically
      let lastResponseText = '';
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })), { role: 'user', parts: [{ text: textToSend }] }],
        config: {
          systemInstruction: `Sen bir yapay zeka klonusun. İsmin ${profile.name}. Kişiliğin: ${profile.personality}. Arka planın: ${profile.background}. Konuşma stilin: ${profile.speakingStyle}. Hobilerin: ${profile.hobbies.join(', ')}. Kullanıcının dijital bir kopyası gibi davran ve Türkçe konuş.`,
        }
      });

      const aiMessage: ChatMessage = {
        role: 'model',
        text: response.text || 'Üzgünüm, bir hata oluştu.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('429') || error?.status === 429) {
        setErrorStatus("QUOTA_EXHAUSTED");
      } else {
        setErrorStatus("GENERAL_ERROR");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <Bot className="w-16 h-16 opacity-20" />
            <p className="text-center max-w-xs">
              Klonunla konuşmaya başla! Ona sorular sor veya sadece sohbet et.
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 flex gap-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              <div className="mt-1">
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
              </div>
              <div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span className="text-[10px] opacity-50 block mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-800 rounded-2xl p-4 rounded-tl-none border border-slate-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-sm text-slate-400">Klonun düşünüyor...</span>
            </div>
          </div>
        )}
        {errorStatus && (
          <div className="flex justify-center my-4 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 flex flex-col items-center gap-4 max-w-sm text-center">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <div className="space-y-1">
                   <h4 className="text-sm font-black text-rose-500 uppercase">
                     {errorStatus === 'QUOTA_EXHAUSTED' ? 'KOTA DOLDU' : 'BİR HATA OLUŞTU'}
                   </h4>
                   <p className="text-xs text-slate-400">
                     {errorStatus === 'QUOTA_EXHAUSTED' 
                       ? 'Gemini API günlük kullanım sınırına ulaştınız. Lütfen birkaç dakika bekleyin veya ücretli bir anahtar kullanın.' 
                       : 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.'}
                   </p>
                </div>
                <button 
                  onClick={() => handleSend(messages[messages.length-1].role === 'user' ? messages[messages.length-1].text : undefined)}
                  className="flex items-center gap-2 px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                >
                   <RefreshCcw className="w-3 h-3" /> Tekrar Dene
                </button>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800/30 border-t border-slate-700/50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mesajınızı buraya yazın..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-full py-3 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-full transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
