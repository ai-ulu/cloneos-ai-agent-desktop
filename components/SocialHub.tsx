
import React, { useState, useEffect } from 'react';
import { aiService } from '../services/ai';
import { 
  Twitter, Instagram, Linkedin, Calendar, TrendingUp, 
  MessageCircle, BarChart3, Plus, Image as ImageIcon, Wand2, Loader2, Sparkles,
  Download, Share2, Palette, Zap, UserPlus, Globe, Hash, UserCircle, Settings,
  PieChart, Send, CheckCircle, Clock, History, Layout, Eye, Trash2
} from 'lucide-react';
import { CloneProfile, SocialAccount, Post } from '../types';

const PLATFORM_ICONS: Record<string, any> = {
  Twitter: <Twitter className="w-4 h-4" />,
  Instagram: <Instagram className="w-4 h-4" />,
  LinkedIn: <Linkedin className="w-4 h-4" />
};

const SocialHub: React.FC<{ profile: CloneProfile }> = ({ profile }) => {
  const [view, setView] = useState<'studio' | 'accounts' | 'analytics' | 'history'>('studio');
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    const saved = localStorage.getItem('clone_os_social_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('clone_os_social_posts');
    return saved ? JSON.parse(saved).map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) })) : [];
  });
  
  const [activeAccountId, setActiveAccountId] = useState<string | null>(accounts[0]?.id || null);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [autoPilotActive, setAutoPilotActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('clone_os_social_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('clone_os_social_posts', JSON.stringify(posts));
  }, [posts]);

  const activeAccount = accounts.find(a => a.id === activeAccountId);

  const createNewAccount = async (platform: SocialAccount['platform']) => {
    setIsProvisioning(true);
    try {
      const response = await aiService.getClient().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Platform: ${platform}. Kişi: ${profile.name}. Bu platform için profesyonel bir klon hesabı oluştur. 
        Kullanıcı adı (handle), biyografi ve içerik stratejisi belirle. JSON: {"handle": "string", "bio": "string", "strategy": "string"}`,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || "{}");
      const avatar = await aiService.generateImage(`Professional social media avatar for ${data.handle}, platform ${platform}, minimalist tech style.`);
      
      const newAccount: SocialAccount = {
        id: Math.random().toString(36).substring(7),
        platform,
        handle: data.handle,
        bio: data.bio,
        avatar: avatar || 'https://via.placeholder.com/150',
        followers: Math.floor(Math.random() * 500) + 50,
        engagementRate: (Math.random() * 5 + 2).toFixed(1) + '%',
        strategy: data.strategy
      };

      setAccounts(prev => [...prev, newAccount]);
      setActiveAccountId(newAccount.id);
      setView('studio');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleAutoPilot = async () => {
    if(!topic.trim() || !activeAccount) return;
    setAutoPilotActive(true);
    setGeneratedContent('');
    setGeneratedImg(null);
    
    // Step 1: Generate Text
    setIsGenerating(true);
    try {
      const textResponse = await aiService.getClient().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Konu: ${topic}. Platform: ${activeAccount.platform}. Klon: ${activeAccount.handle}. 
        Strateji: ${activeAccount.strategy}. Viral potansiyeli maksimum, etkileşim odaklı bir paylaşım metni oluştur. 
        Hashtagleri ve platforma özel tonlamayı unutma.`,
        config: {
          systemInstruction: `Sen ${activeAccount.handle} isimli yapay zeka klonusun. Kişiliğin: ${profile.personality}. Sosyal medyada viral içerik üretme uzmanısın.`
        }
      });
      setGeneratedContent(textResponse.text || '');
      setIsGenerating(false);

      // Step 2: Generate Visual
      setIsGeneratingImg(true);
      const img = await aiService.generateImage(`Viral social media visual for ${activeAccount.platform} about ${topic}, cinematic lighting, futuristic and high quality, related to: ${textResponse.text?.substring(0, 100)}`);
      setGeneratedImg(img);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setIsGeneratingImg(false);
      setAutoPilotActive(false);
    }
  };

  const publishPost = () => {
    if (!activeAccount || !generatedContent) return;
    
    const newPost: Post = {
      id: Math.random().toString(36).substring(7),
      accountId: activeAccount.id,
      content: generatedContent,
      imageUrl: generatedImg || undefined,
      timestamp: new Date(),
      stats: {
        likes: 0,
        shares: 0,
        comments: 0
      }
    };

    setPosts(prev => [newPost, ...prev]);
    setGeneratedContent('');
    setGeneratedImg(null);
    setTopic('');
    setView('history');
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    if (activeAccountId === id) setActiveAccountId(null);
  };

  return (
    <div className="flex h-full bg-[#050508] text-slate-400 overflow-hidden font-sans">
      {/* Sidebar - Accounts & Navigation */}
      <div className="w-80 border-r border-white/5 bg-zinc-950/40 p-8 flex flex-col gap-10 shrink-0">
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Neural Kanallar</h3>
              <button onClick={() => setView('accounts')} className="p-2 hover:bg-white/5 rounded-xl text-cyan-400 transition-all"><Plus className="w-4 h-4" /></button>
           </div>
           <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="group relative">
                  <button 
                    onClick={() => { setActiveAccountId(acc.id); setView('studio'); }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all border ${activeAccountId === acc.id ? 'bg-cyan-500/10 border-cyan-500/20 text-white' : 'border-transparent hover:bg-white/5'}`}
                  >
                    <img src={acc.avatar} className="w-8 h-8 rounded-full border border-white/10" />
                    <div className="flex-1 text-left">
                       <div className="text-[11px] font-black truncate">{acc.handle}</div>
                       <div className="text-[8px] text-slate-500 uppercase flex items-center gap-1">{PLATFORM_ICONS[acc.platform]} {acc.platform}</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => deleteAccount(acc.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {accounts.length === 0 && <p className="text-[10px] text-slate-700 italic px-2">Kanal oluşturulmadı.</p>}
           </div>
        </div>

        <div className="space-y-4 pt-10 border-t border-white/5">
           <button onClick={() => setView('studio')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'studio' ? 'bg-white/10 text-white shadow-xl' : 'hover:bg-white/5'}`}>
              <Wand2 className="w-4 h-4" /> <span className="text-xs font-black uppercase">Viral Studio</span>
           </button>
           <button onClick={() => setView('history')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'history' ? 'bg-white/10 text-white shadow-xl' : 'hover:bg-white/5'}`}>
              <History className="w-4 h-4" /> <span className="text-xs font-black uppercase">Published Feed</span>
           </button>
           <button onClick={() => setView('analytics')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'analytics' ? 'bg-white/10 text-white shadow-xl' : 'hover:bg-white/5'}`}>
              <PieChart className="w-4 h-4" /> <span className="text-xs font-black uppercase">Growth Stats</span>
           </button>
        </div>

        <div className="flex-1" />

        <div className="bg-cyan-500/5 border border-cyan-500/10 p-6 rounded-3xl">
           <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase mb-3">
              <Zap className="w-3.5 h-3.5" /> Neural Influence
           </div>
           <div className="text-2xl font-black text-white">
              {posts.length > 0 ? (posts.length * 1.2).toFixed(1) + 'K' : '0.0K'}
           </div>
           <div className="text-[9px] text-slate-500 uppercase mt-1">Simüle Edilen Toplam Erişim</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-black/20">
        {view === 'accounts' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
             <header className="space-y-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Neural Account Provisioning</h2>
                <p className="text-slate-500">Klonun için platforma özel stratejilerle yeni kimlikler tanımla.</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['Twitter', 'Instagram', 'LinkedIn'].map((platform) => (
                  <div key={platform} className="bg-zinc-900/30 border border-white/5 p-10 rounded-[48px] flex flex-col items-center gap-8 group hover:border-cyan-500/40 transition-all shadow-2xl relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center scale-[1.8] text-slate-600 group-hover:text-cyan-400 group-hover:scale-[2] transition-all duration-700">
                        {PLATFORM_ICONS[platform]}
                     </div>
                     <div className="text-center relative z-10">
                        <h4 className="text-xl font-black text-white uppercase mb-2">{platform}</h4>
                        <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-widest">Otonom Strateji & Kimlik</p>
                     </div>
                     <button 
                       disabled={isProvisioning}
                       onClick={() => createNewAccount(platform as any)}
                       className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white p-5 rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all flex items-center justify-center gap-3 relative z-10"
                     >
                        {isProvisioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Kurulumu Başlat
                     </button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'studio' && activeAccount && (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <img src={activeAccount.avatar} className="w-16 h-16 rounded-[24px] border border-cyan-500/20 shadow-2xl" />
                   <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">@{activeAccount.handle}</h2>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase text-cyan-400">
                         {PLATFORM_ICONS[activeAccount.platform]} {activeAccount.platform} • Viral Strateji Aktif
                      </div>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl text-center">
                      <div className="text-xs font-black text-white">{activeAccount.followers}</div>
                      <div className="text-[8px] text-slate-600 uppercase">Takipçi</div>
                   </div>
                   <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl text-center">
                      <div className="text-xs font-black text-white">{activeAccount.engagementRate}</div>
                      <div className="text-[8px] text-slate-600 uppercase">Rate</div>
                   </div>
                </div>
             </div>

             <div className="bg-zinc-900/30 border border-white/5 p-10 rounded-[48px] space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none opacity-30" />
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Hedef Konu / İçerik Fikri</label>
                    <span className="text-[9px] font-bold text-cyan-500/60 uppercase">Strateji: {activeAccount.strategy}</span>
                  </div>
                  <input 
                    value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="Örn: Yapay zekanın geleceği veya bugün başımdan geçen ilginç bir olay..."
                    className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 text-white text-base outline-none focus:border-cyan-400/50 transition-all placeholder:text-slate-700"
                  />
                </div>
                
                <div className="flex gap-4 relative z-10">
                   <button 
                    onClick={handleAutoPilot} disabled={autoPilotActive || !topic.trim()}
                    className="flex-1 flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white p-5 rounded-2xl font-black text-xs uppercase shadow-xl transition-all"
                  >
                    {autoPilotActive ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Otonom Viral Paket Üret
                  </button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">
                {generatedContent && (
                  <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">İçerik Taslağı</h3>
                       <button onClick={() => setGeneratedContent('')} className="text-[9px] font-bold text-rose-500 uppercase">Temizle</button>
                    </div>
                    <div className="bg-black/40 border border-white/10 p-8 rounded-[40px] relative shadow-2xl group overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       <textarea 
                          value={generatedContent} onChange={e => setGeneratedContent(e.target.value)}
                          className="w-full bg-transparent text-slate-200 text-base leading-relaxed outline-none min-h-[350px] resize-none custom-scrollbar font-sans relative z-10"
                       />
                       <div className="mt-8 flex justify-between items-center relative z-10">
                          <span className="text-[9px] text-slate-600 uppercase font-black">Ready for Deployment</span>
                          <button 
                            onClick={publishPost}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                          >
                             <CheckCircle className="w-4 h-4" /> Yayınla
                          </button>
                       </div>
                    </div>
                  </div>
                )}
                
                {(generatedImg || isGeneratingImg) && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                     <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2">Neural Visual Asset</h3>
                     <div className="aspect-square bg-black/60 border border-white/10 rounded-[40px] overflow-hidden relative shadow-2xl flex items-center justify-center group">
                        {isGeneratingImg ? (
                           <div className="flex flex-col items-center gap-4">
                              <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Görsel İşleniyor...</span>
                           </div>
                        ) : (
                          <>
                            <img src={generatedImg!} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <button onClick={() => setGeneratedImg(null)} className="p-4 bg-rose-600 rounded-full text-white shadow-2xl"><Trash2 className="w-6 h-6" /></button>
                            </div>
                          </>
                        )}
                     </div>
                  </div>
                )}
             </div>
          </div>
        )}

        {view === 'history' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
             <header className="flex items-center justify-between">
                <div className="space-y-2">
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Published Feed</h2>
                   <p className="text-slate-500 text-sm">Onaylanan ve yayına alınan otonom içerikler.</p>
                </div>
                <button onClick={() => setPosts([])} className="px-6 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black uppercase border border-rose-500/20">Geçmişi Sil</button>
             </header>

             <div className="space-y-8">
                {posts.length === 0 ? (
                   <div className="py-20 flex flex-col items-center justify-center opacity-10 gap-6">
                      <Layout className="w-24 h-24" />
                      <span className="text-xs font-black uppercase tracking-[0.5em]">Henüz Paylaşım Yok</span>
                   </div>
                ) : (
                   posts.map(post => {
                      const acc = accounts.find(a => a.id === post.accountId);
                      return (
                        <div key={post.id} className="bg-zinc-900/30 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-80 group">
                           {post.imageUrl && (
                              <div className="w-full md:w-80 h-48 md:h-full shrink-0 overflow-hidden">
                                 <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                              </div>
                           )}
                           <div className="flex-1 p-8 flex flex-col justify-between">
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <img src={acc?.avatar} className="w-6 h-6 rounded-full border border-white/10" />
                                       <span className="text-[10px] font-black text-white uppercase tracking-widest">@{acc?.handle}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-slate-600 font-black uppercase">
                                       <Clock className="w-3 h-3" /> {post.timestamp.toLocaleString()}
                                    </div>
                                 </div>
                                 <p className="text-xs text-slate-300 leading-relaxed line-clamp-6">{post.content}</p>
                              </div>
                              <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                                 <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400">
                                    <TrendingUp className="w-4 h-4" /> Simüle Edildi
                                 </div>
                                 <div className="flex gap-4">
                                    <span className="text-[10px] text-slate-500">Likes: {Math.floor(Math.random() * 100)}</span>
                                    <span className="text-[10px] text-slate-500">Shares: {Math.floor(Math.random() * 20)}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      );
                   })
                )}
             </div>
          </div>
        )}

        {!activeAccount && view === 'studio' && (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20">
              <Share2 className="w-24 h-24" />
              <div className="space-y-2">
                 <h2 className="text-2xl font-black uppercase tracking-widest text-white">Neural Kanal Seçimi Bekleniyor</h2>
                 <p className="text-xs uppercase tracking-widest">Başlamak için sol menüden bir hesap seçin veya yeni bir platform tanımlayın.</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default SocialHub;
