
import React from 'react';
import { BookOpen, MousePointer2, Mic, Terminal, Code, Database, ChevronRight, Monitor, Download, ShieldCheck } from 'lucide-react';

const HelpCenter: React.FC = () => {
  const steps = [
    {
      icon: <Monitor className="w-5 h-5 text-pink-400" />,
      title: "Masaüstü Kurulumu (PWA)",
      desc: "CloneOS'u masaüstüne kurmak için tarayıcı adres çubuğundaki 'Yükle' butonuna bas. Bu sayede uygulamayı bağımsız bir pencerede ve dock/görev çubuğunda kendi ikonuyla kullanabilirsin."
    },
    {
      icon: <MousePointer2 className="w-5 h-5 text-cyan-400" />,
      title: "Pencere Yönetimi",
      desc: "Masaüstündeki ikonlara tıklayarak uygulamaları açabilir, alttaki görev çubuğundan pencereler arasında geçiş yapabilirsin."
    },
    {
      icon: <Terminal className="w-5 h-5 text-purple-400" />,
      title: "Otonom Görevler",
      desc: "'Komuta Merkezi'ne git ve klonuna bir hedef ver. O, senin için uzman ajanlar atayıp işi bitirecektir."
    },
    {
      icon: <Mic className="w-5 h-5 text-emerald-400" />,
      title: "Sesli Etkileşim",
      desc: "'Sesli Asistan'ı açarak klonunla canlı olarak konuşabilir, ona ekranını (kamera üzerinden) gösterebilirsin."
    },
    {
      icon: <Code className="w-5 h-5 text-amber-400" />,
      title: "Kod ve Geliştirme",
      desc: "Ajanların yazdığı kodlar otomatik olarak 'Geliştirme Ortamı'na düşer. Orada kodları düzenleyip çalıştırabilirsin."
    },
    {
      icon: <Database className="w-5 h-5 text-blue-400" />,
      title: "Bilgi Bankası",
      desc: "Klonunun öğrendiği her şey 'Bilgi Bankası'nda saklanır. Burayı klonunun hafızası gibi düşünebilirsin."
    }
  ];

  return (
    <div className="h-full bg-[#050508] text-slate-300 p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-12 pb-20">
        <header className="text-center space-y-4">
          <div className="inline-flex p-4 bg-cyan-500/10 rounded-3xl border border-cyan-500/20 mb-4">
             <BookOpen className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">CloneOS Kullanım Klavuzu</h2>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            Yapay zeka klonunun kontrolü tamamen sende. İşte sistemi verimli kullanman için bilmen gerekenler.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="group bg-white/[0.02] border border-white/5 p-8 rounded-[40px] flex items-center gap-8 hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all duration-500">
               <div className="p-5 bg-black/40 rounded-3xl group-hover:scale-110 transition-transform shadow-2xl">
                  {step.icon}
               </div>
               <div className="flex-1 space-y-2">
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">{step.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
               </div>
               <ChevronRight className="w-6 h-6 text-slate-800 group-hover:text-cyan-500 transition-colors" />
            </div>
          ))}
        </div>

        <div className="bg-cyan-600/10 border border-cyan-500/20 p-10 rounded-[48px] text-center space-y-6">
           <div className="flex justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h4 className="font-black text-white uppercase tracking-widest">Hemen Başla</h4>
           </div>
           <p className="text-sm text-slate-400 italic">"Masaüstündeki 'Komuta Merkezi' ikonuna tıkla ve ilk hedefini belirle."</p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
