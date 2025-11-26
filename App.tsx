
import React, { useState, useEffect, useRef } from 'react';
import { SERVERS, CURRENT_USER, INITIAL_WELCOME_MESSAGE, PLAYLIST, SCENE_THEMES, HOME_SERVER_ID, FONT_OPTIONS, FRAME_OPTIONS, REACTION_OPTIONS, PERSONALITIES, SCENE_AVATARS } from './constants';
import { Server, Channel, Message, User, Song, Theme, FontOption, FrameOption } from './types';
import { generateBotResponse, generateSpeech } from './services/geminiService';
import { Hash, Mic, Settings, Hash as HashIcon, Send, Menu, X, Play, Pause, SkipForward, SkipBack, Disc, Palette, User as UserIcon, Save, Home, MessageCircle, Camera, Image as ImageIcon, LogOut, Globe, Edit, Type, Eye, Heart, Sparkles, Smile, MessageSquare, Star, Plus, UserPlus, Volume2, Wand2, Loader, Dice5, Pencil, Search, Users } from 'lucide-react';

// --- SHARED COMPONENTS ---

const Avatar = ({ user, size = 'md' }: { user: User, size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };
  
  const frame = FRAME_OPTIONS.find(f => f.id === (user.frame || 'none'));

  return (
    <div className={`relative ${sizeClasses[size]}`}>
       <div className={`w-full h-full relative overflow-hidden ${frame?.cssClass}`}>
         <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-full h-full object-cover filter contrast-125 saturate-150 sepia-[0.3]" 
         />
       </div>
       {frame?.overlay && (
         <div className="absolute -top-2 -right-2 text-xl drop-shadow-md z-10 animate-pulse">
           {frame.overlay}
         </div>
       )}
    </div>
  );
};

// --- LOGIN COMPONENT ---
const LoginScreen = ({ onLogin, theme }: { onLogin: (user: Partial<User>) => void, theme: Theme }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Scene Kid',
    country: '',
    frame: 'none'
  });
  
  const [avatarUrl, setAvatarUrl] = useState(SCENE_AVATARS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.country.trim()) return;
    
    onLogin({ 
      name: formData.name, 
      age: formData.age,
      gender: formData.gender,
      country: formData.country,
      avatar: avatarUrl, 
      color: theme.primary,
      frame: formData.frame
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center striped-bg overflow-y-auto"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div className="w-full max-w-lg p-8 border-4 shadow-[10px_10px_0_0_rgba(255,255,255,0.2)] animate-float m-4"
           style={{ borderColor: theme.primary, backgroundColor: theme.panel }}>
        <h1 className="text-4xl text-center mb-2 font-bold" style={{ fontFamily: '"Rubik Glitch", system-ui', color: theme.primary }}>
          RawrChat 2007
        </h1>
        <p className="text-center mb-6 text-sm uppercase tracking-widest opacity-60">PASSPORT REGISTRATION</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex justify-center mb-4 flex-col items-center">
             <div className="mb-2">
                <Avatar user={{ ...CURRENT_USER, avatar: avatarUrl, frame: formData.frame }} size="lg" />
             </div>
             <button 
               type="button"
               onClick={() => setAvatarUrl(SCENE_AVATARS[Math.floor(Math.random() * SCENE_AVATARS.length)])}
               className="text-xs hover:underline flex items-center gap-1"
             >
               <Dice5 size={12} /> Roll Random Pic
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1 uppercase tracking-widest opacity-60">Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border-2 outline-none text-lg"
                style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.background }}
                placeholder="xX_User_Xx"
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1 uppercase tracking-widest opacity-60">Country</label>
              <input 
                type="text" 
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-2 border-2 outline-none text-lg"
                style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.background }}
                placeholder="Brazil, USA..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs mb-1 uppercase tracking-widest opacity-60">Age</label>
              <input 
                type="number" 
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-2 border-2 outline-none text-lg"
                style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.background }}
                placeholder="18"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 uppercase tracking-widest opacity-60">Frame</label>
              <select 
                name="frame"
                value={formData.frame}
                onChange={handleChange}
                className="w-full p-2 border-2 outline-none text-lg"
                style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.background }}
              >
                {FRAME_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
             <button 
              type="submit" 
              className="w-full py-3 font-bold text-xl uppercase tracking-widest hover:brightness-110 active:translate-y-1 transition-all"
              style={{ backgroundColor: theme.primary, color: theme.id === 'light' ? 'white' : 'black' }}
            >
              Enter World
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- NPC CREATOR MODAL ---
const NpcCreator = ({ theme, onClose, onCreate }: { theme: Theme, onClose: () => void, onCreate: (npc: User) => void }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '18',
        gender: 'Emo',
        personality: 'normal',
        bio: 'Just another scene kid.',
    });
    const [avatarUrl, setAvatarUrl] = useState(SCENE_AVATARS[Math.floor(Math.random() * SCENE_AVATARS.length)]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleRandomAvatar = () => {
        setAvatarUrl(SCENE_AVATARS[Math.floor(Math.random() * SCENE_AVATARS.length)]);
    };

    const handleCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: `custom_${Date.now()}`,
            name: formData.name || 'Anon',
            avatar: avatarUrl,
            status: 'online',
            color: theme.primary,
            isBot: true,
            bio: formData.bio,
            age: formData.age,
            gender: formData.gender,
            personality: formData.personality as any,
            font: 'VT323',
            frame: FRAME_OPTIONS[Math.floor(Math.random() * FRAME_OPTIONS.length)].id
        };
        onCreate(newUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
             <div className="w-full max-w-lg border-4 shadow-[10px_10px_0_0_rgba(255,255,255,0.2)] my-4"
                 style={{ backgroundColor: theme.background, borderColor: theme.secondary, color: theme.text }}>
                 <div className="p-4 border-b-2 flex justify-between items-center" style={{ borderColor: theme.border }}>
                     <h2 className="text-xl font-bold uppercase">Summon Custom Friend</h2>
                     <button onClick={onClose}><X size={24} /></button>
                 </div>
                 
                 <div className="p-6 space-y-4">
                     {/* AVATAR SELECTION SECTION */}
                     <div className="flex gap-4 items-start">
                         <div className="w-32 h-32 border-2 relative flex-shrink-0 group overflow-hidden">
                             <img src={avatarUrl} className="w-full h-full object-cover filter contrast-125" />
                         </div>
                         <div className="flex-1 space-y-2">
                             <div className="text-sm font-bold uppercase opacity-80" style={{ color: theme.primary }}>Profile Picture</div>
                             <button 
                                onClick={handleRandomAvatar}
                                className="w-full border py-2 flex items-center justify-center gap-2 text-xs font-bold hover:bg-white/10"
                                style={{ borderColor: theme.primary, color: theme.primary }}
                             >
                                <Dice5 size={16} /> RANDOMIZE SCENE PIC
                             </button>
                             <div className="text-center text-xs opacity-50">- OR -</div>
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border py-2 flex items-center justify-center gap-2 text-xs font-bold hover:bg-white/10"
                                style={{ borderColor: theme.secondary, color: theme.secondary }}
                             >
                                <ImageIcon size={16} /> UPLOAD CUSTOM PHOTO
                             </button>
                             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCustomImage} />
                         </div>
                     </div>

                     <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t" style={{ borderColor: theme.border }}>
                        <div>
                             <label className="text-xs uppercase opacity-60">Name</label>
                             <input 
                                className="w-full p-2 border bg-transparent" 
                                style={{ borderColor: theme.border }} 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="xX_Name_Xx"
                                required
                             />
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs uppercase opacity-60">Age</label>
                                <input 
                                    className="w-full p-2 border bg-transparent" 
                                    style={{ borderColor: theme.border }} 
                                    value={formData.age}
                                    onChange={e => setFormData({...formData, age: e.target.value})}
                                />
                            </div>
                            <div>
                                 <label className="text-xs uppercase opacity-60">Gender</label>
                                 <input 
                                    className="w-full p-2 border bg-transparent" 
                                    style={{ borderColor: theme.border }} 
                                    value={formData.gender}
                                    onChange={e => setFormData({...formData, gender: e.target.value})}
                                 />
                            </div>
                         </div>
                         <div>
                             <label className="text-xs uppercase opacity-60">Personality</label>
                             <select 
                                className="w-full p-2 border bg-transparent"
                                style={{ borderColor: theme.border, color: theme.text }}
                                value={formData.personality}
                                onChange={e => setFormData({...formData, personality: e.target.value})}
                             >
                                {PERSONALITIES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                             </select>
                         </div>
                         <div>
                             <label className="text-xs uppercase opacity-60">Bio</label>
                             <input 
                                className="w-full p-2 border bg-transparent" 
                                style={{ borderColor: theme.border }} 
                                value={formData.bio}
                                onChange={e => setFormData({...formData, bio: e.target.value})}
                             />
                         </div>
                         <button className="w-full py-3 font-bold uppercase hover:brightness-110 mt-2" style={{ backgroundColor: theme.secondary, color: 'black' }}>
                             Summon to Server
                         </button>
                     </form>
                 </div>
             </div>
        </div>
    );
};

// --- PROFILE VIEWER & EDITOR MODAL ---
const ProfileViewer = ({ user, theme, onClose, onDM, onUpdateUser }: { user: User, theme: Theme, onClose: () => void, onDM: (user: User) => void, onUpdateUser: (updatedUser: User) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdateUser(editForm);
    setIsEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  return (
     <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
        <div 
          className="w-full max-w-md border-4 shadow-[10px_10px_0_0_rgba(255,255,255,0.2)] relative animate-float"
          style={{ backgroundColor: theme.background, borderColor: theme.primary, color: theme.text }}
          onClick={(e) => e.stopPropagation()}
        >
           <button onClick={onClose} className="absolute top-2 right-2 z-10 hover:text-red-500 transition-colors bg-black/50 rounded-full p-1">
             <X size={24} />
           </button>
           
           {/* Banner */}
           <div className="h-32 w-full border-b-2 relative overflow-hidden" style={{ borderColor: theme.border }}>
             <img src={editForm.banner || 'https://picsum.photos/seed/banner/600/200'} className="w-full h-full object-cover filter contrast-125 saturate-150" alt="banner" />
           </div>

           {/* Avatar & Info */}
           <div className="px-6 pb-6 relative">
              <div className="absolute -top-12 left-6 group">
                {isEditing ? (
                    <div className="relative w-24 h-24 border-2 border-white cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <img src={editForm.avatar} className="w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center"><Camera /></div>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleAvatarUpload} />
                    </div>
                ) : (
                    <Avatar user={editForm} size="lg" />
                )}
              </div>
              
              <div className="mt-14">
                 {isEditing ? (
                    <div className="space-y-2 mb-4">
                        <input 
                            value={editForm.name} 
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            className="w-full text-2xl font-bold bg-white/10 p-1 border"
                            placeholder="Name"
                        />
                         <div className="flex gap-2">
                             <input value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className="w-1/3 bg-white/10 p-1 border" placeholder="Age" />
                             <input value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-1/3 bg-white/10 p-1 border" placeholder="Gender" />
                         </div>
                         <textarea 
                            value={editForm.bio}
                            onChange={e => setEditForm({...editForm, bio: e.target.value})}
                            className="w-full bg-white/10 p-1 border h-20"
                            placeholder="Bio"
                         />
                         <div className="flex gap-2">
                            <button onClick={handleSave} className="flex-1 bg-green-600 text-white font-bold py-1">SAVE</button>
                            <button onClick={() => setIsEditing(false)} className="flex-1 bg-red-600 text-white font-bold py-1">CANCEL</button>
                         </div>
                    </div>
                 ) : (
                    <>
                        <div className="flex justify-between items-start">
                             <h2 className="text-3xl font-bold" style={{ color: user.color, fontFamily: user.font || 'inherit' }}>{user.name}</h2>
                             {user.isBot && (
                                 <button onClick={() => setIsEditing(true)} className="text-xs flex items-center gap-1 opacity-50 hover:opacity-100">
                                     <Pencil size={12} /> Edit Bot
                                 </button>
                             )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm opacity-70 mb-4">
                            <span>{user.age ? `${user.age} y/o` : 'Age: ??'}</span>
                            <span>•</span>
                            <span>{user.country || 'Unknown'}</span>
                            <span>•</span>
                            <span className="capitalize">{user.personality || 'Normal'}</span>
                             <span>•</span>
                             <span>{user.gender || '??'}</span>
                        </div>

                        <div className="p-3 border-2 mb-6 text-lg italic" style={{ borderColor: theme.border, backgroundColor: theme.panel }}>
                            "{user.bio || 'I am mysterious...'}"
                        </div>

                        <button 
                        onClick={() => onDM(user)}
                        className="w-full py-2 font-bold text-lg uppercase flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                        style={{ backgroundColor: theme.secondary, color: 'black' }}
                        >
                        <MessageCircle size={20} /> Send Message
                        </button>
                    </>
                 )}
              </div>
           </div>
        </div>
     </div>
  );
};

// --- SERVER BROWSER MODAL ---
const ServerBrowser = ({ servers, joinedIds, theme, onClose, onJoin }: { servers: Server[], joinedIds: string[], theme: Theme, onClose: () => void, onJoin: (serverId: string) => void }) => {
    return (
        <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl border-4 shadow-[10px_10px_0_0_rgba(255,255,255,0.2)] h-[80vh] flex flex-col"
                 style={{ backgroundColor: theme.background, borderColor: theme.primary, color: theme.text }}>
                <div className="p-4 border-b-2 flex justify-between items-center" style={{ borderColor: theme.border }}>
                     <h2 className="text-2xl font-bold uppercase flex items-center gap-2">
                        <Globe /> World Browser
                     </h2>
                     <button onClick={onClose}><X size={24} /></button>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
                    {servers.map(server => {
                        const isJoined = joinedIds.includes(server.id);
                        return (
                            <div key={server.id} className="border-2 p-3 flex flex-col gap-2 relative group hover:scale-[1.02] transition-transform"
                                 style={{ borderColor: theme.border, backgroundColor: theme.panel }}>
                                <div className="h-24 w-full overflow-hidden border border-white/20">
                                    <img src={server.icon} className="w-full h-full object-cover filter contrast-125" />
                                </div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold" style={{ color: theme.secondary }}>{server.name}</h3>
                                    {isJoined ? (
                                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">JOINED</span>
                                    ) : (
                                        <button 
                                            onClick={() => onJoin(server.id)}
                                            className="text-xs font-bold px-3 py-1 bg-white text-black hover:bg-gray-200"
                                        >
                                            JOIN +
                                        </button>
                                    )}
                                </div>
                                <div className="text-xs opacity-70 flex gap-2">
                                    <span className="flex items-center gap-1"><Users size={10} /> {server.users.length} Users</span>
                                    <span className="flex items-center gap-1 uppercase border px-1 rounded text-[8px]">{server.type || 'Chat'}</span>
                                </div>
                                <div className="text-sm italic opacity-80">
                                    {server.channels.map(c => `#${c.name}`).join(', ').slice(0, 50)}...
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [currentTheme, setCurrentTheme] = useState<Theme>(SCENE_THEMES[0]);
  
  // Initialize Servers State (so we can add NPCs to them)
  const [allServers, setAllServers] = useState<Server[]>(SERVERS);
  // Joined servers (Start with just NightLov)
  const [joinedServerIds, setJoinedServerIds] = useState<string[]>(['nightlov']);

  const [activeServerId, setActiveServerId] = useState<string>('nightlov');
  const [activeChannelId, setActiveChannelId] = useState<string>('nl1'); // Default to nightlov channel
  
  // Channels and Messages
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'nl1': [INITIAL_WELCOME_MESSAGE]
  });
  
  // Direct Messages State
  const [dmChannels, setDmChannels] = useState<Channel[]>([]);
  
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'theme'>('profile');
  
  // Modals
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isNpcCreatorOpen, setIsNpcCreatorOpen] = useState(false);
  const [isServerBrowserOpen, setIsServerBrowserOpen] = useState(false);

  // --- MUSIC PLAYER STATE ---
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileBannerInputRef = useRef<HTMLInputElement>(null);
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived State
  const isHome = activeServerId === HOME_SERVER_ID;
  const activeServer = !isHome 
    ? allServers.find(s => s.id === activeServerId) || allServers[0]
    : { id: HOME_SERVER_ID, name: 'Direct Messages', icon: '', channels: dmChannels, users: [], allowImages: true, type: 'bot' }; 
  
  const activeChannel = !isHome 
    ? activeServer.channels.find(c => c.id === activeChannelId) || activeServer.channels[0]
    : dmChannels.find(c => c.id === activeChannelId) || { id: 'dummy', name: 'Select a DM', type: 'dm' as const };

  const currentMessages = messages[activeChannelId] || [];
  const isCommunity = (activeServer as Server).type === 'community';

  // --- EFFECTS ---

  useEffect(() => {
    document.body.style.fontFamily = currentUser.font || 'VT323';
  }, [currentUser.font]);

  useEffect(() => {
    document.documentElement.style.setProperty('--scrollbar-thumb', currentTheme.primary);
    document.documentElement.style.setProperty('--scrollbar-border', currentTheme.secondary);
  }, [currentTheme]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play failed interaction required", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSongIndex]);

  // --- AUTONOMOUS CHAT LOOP ---
  useEffect(() => {
    if (!isLoggedIn) return;

    const chatLoop = setInterval(async () => {
      const server = activeServer as Server;
      if (isHome || server.type === 'human') return;
      if (isTyping) return;

      setIsTyping(true);
      
      const bots = server.users.filter(u => u.isBot);
      if (bots.length === 0) {
          setIsTyping(false);
          return;
      }
      
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      const lastMsg = currentMessages[currentMessages.length - 1];
      const lastMsgText = lastMsg ? lastMsg.content : "Start a conversation.";
      
      let speaker = randomBot;
      if (lastMsg && lastMsg.userId === randomBot.id && bots.length > 1 && Math.random() > 0.5) {
            speaker = bots.find(b => b.id !== randomBot.id) || randomBot;
      }

      try {
        const response = await generateBotResponse(
            currentMessages,
            [speaker], 
            lastMsgText,
            activeServer.name,
            activeChannel.name,
            currentUser.country
        );
        
        if (response) {
          let audioUrl: string | null = null;
          if (Math.random() < 0.2) {
             audioUrl = await generateSpeech(response.text, speaker.gender, speaker.personality);
          }

          const botMessage: Message = {
              id: Date.now().toString(),
              userId: response.botId,
              content: response.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              reactions: Math.random() > 0.7 ? { [REACTION_OPTIONS[Math.floor(Math.random() * REACTION_OPTIONS.length)]]: 1 } : undefined,
              audio: audioUrl || undefined
          };

          setMessages(prev => ({
              ...prev,
              [activeChannelId]: [...(prev[activeChannelId] || []), botMessage]
          }));
        }
      } catch (e) {
        console.error("Auto chat error", e);
      } finally {
        setIsTyping(false);
      }

    }, 2000); 

    return () => clearInterval(chatLoop);
  }, [activeServerId, activeChannelId, isTyping, isLoggedIn, currentMessages]);

  // --- HANDLERS ---

  const handleLogin = (userData: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setMessages({}); 
  };

  const handleCreateNPC = (npc: User) => {
      // Add NPC to current active server if not home, otherwise add to first available
      setAllServers(prev => {
          return prev.map(s => {
              if (s.id === activeServerId || (activeServerId === HOME_SERVER_ID && s.id === 'nightlov')) {
                  return { ...s, users: [...s.users, npc] };
              }
              return s;
          });
      });
  };

  const handleUpdateUser = (updatedUser: User) => {
    setAllServers(prev => {
        return prev.map(s => {
            return {
                ...s,
                users: s.users.map(u => u.id === updatedUser.id ? updatedUser : u)
            };
        });
    });
    setViewingUser(updatedUser); // Update the modal view
  };

  const handleJoinServer = (serverId: string) => {
    if (!joinedServerIds.includes(serverId)) {
        setJoinedServerIds(prev => [...prev, serverId]);
        setActiveServerId(serverId);
        const server = allServers.find(s => s.id === serverId);
        if (server) setActiveChannelId(server.channels[0].id);
        setIsServerBrowserOpen(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
  };

  const sendMessage = async (text: string, image?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image
    };

    setMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMessage]
    }));
    setInputText('');
    setIsTyping(true);

    if (activeChannel.type === 'dm') {
      const participantId = activeChannel.participants?.find(p => p !== currentUser.id);
      if (participantId) {
        const allUsers = allServers.flatMap(s => s.users);
        const botUser = allUsers.find(u => u.id === participantId);
        if (botUser && botUser.isBot) {
           handleBotResponse(botUser, text, "Direct Messages", "Private Chat");
        } else {
          setIsTyping(false);
        }
      } else {
        setIsTyping(false);
      }
    } else {
      const isHumanServer = (activeServer as Server).type === 'human';
      
      try {
        const response = await generateBotResponse(
          currentMessages,
          (activeServer as Server).users,
          text,
          activeServer.name + (isHumanServer ? " (Act like a real human internet user)" : ""),
          activeChannel.name,
          currentUser.country 
        );

        if (response) {
           const bot = (activeServer as Server).users.find(u => u.id === response.botId);
           if(bot) {
              let audioUrl: string | null = null;
              if (Math.random() < 0.2) {
                 audioUrl = await generateSpeech(response.text, bot.gender, bot.personality);
              }

              const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                userId: bot.id,
                content: response.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                audio: audioUrl || undefined
              };
              setTimeout(() => {
                setMessages(prev => ({
                  ...prev,
                  [activeChannelId]: [...(prev[activeChannelId] || []), botMsg]
                }));
                setIsTyping(false);
              }, isHumanServer ? 3000 : 1500); 
              return;
           }
        } 
        setIsTyping(false);
      } catch (err) {
        console.error(err);
        setIsTyping(false);
      }
    }
  };

  const handleBotResponse = async (botUser: User, userMsg: string, serverName: string, channelName: string) => {
      try {
        const response = await generateBotResponse(
          currentMessages,
          [botUser], 
          userMsg,
          serverName,
          channelName,
          currentUser.country
        );
        
        if (response) {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              userId: botUser.id,
              content: response.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setTimeout(() => {
              setMessages(prev => ({
                ...prev,
                [activeChannelId]: [...(prev[activeChannelId] || []), botMessage]
              }));
              setIsTyping(false);
            }, 1500);
        } else {
          setIsTyping(false);
        }
      } catch (e) {
        setIsTyping(false);
      }
  }

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(prev => {
        const channelMessages = prev[activeChannelId] || [];
        return {
            ...prev,
            [activeChannelId]: channelMessages.map(msg => {
                if (msg.id === messageId) {
                    const currentCount = msg.reactions?.[emoji] || 0;
                    return {
                        ...msg,
                        reactions: {
                            ...msg.reactions,
                            [emoji]: currentCount + 1
                        }
                    };
                }
                return msg;
            })
        };
    });
  };

  const handleStartDM = (targetUser: User) => {
    setViewingUser(null);
    if (targetUser.id === currentUser.id) return;
    
    const existingChannel = dmChannels.find(c => c.participants?.includes(targetUser.id));
    if (existingChannel) {
      setActiveServerId(HOME_SERVER_ID);
      setActiveChannelId(existingChannel.id);
    } else {
      const newChannel: Channel = {
        id: `dm-${Date.now()}`,
        name: targetUser.name,
        type: 'dm',
        participants: [currentUser.id, targetUser.id]
      };
      setDmChannels(prev => [...prev, newChannel]);
      setActiveServerId(HOME_SERVER_ID);
      setActiveChannelId(newChannel.id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        sendMessage("", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCurrentUser(prev => ({ ...prev, [field]: base64String }));
      };
      reader.readAsDataURL(file);
    }
  }

  const getUser = (userId: string): User | undefined => {
    if (userId === currentUser.id) return currentUser;
    let user = (activeServer as any).users?.find((u: User) => u.id === userId);
    if (!user) {
      user = allServers.flatMap(s => s.users).find(u => u.id === userId);
    }
    return user;
  };

  const handleMusicControl = (action: 'play' | 'pause' | 'next' | 'prev') => {
    if (action === 'play') setIsPlaying(true);
    if (action === 'pause') setIsPlaying(false);
    if (action === 'next') setCurrentSongIndex((prev) => (prev + 1) % PLAYLIST.length);
    if (action === 'prev') setCurrentSongIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setCurrentUser(prev => ({
      ...prev,
      name: formData.get('username') as string,
      bio: formData.get('bio') as string,
      color: formData.get('color') as string,
      frame: formData.get('frame') as string
    }));
    setIsSettingsOpen(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} theme={currentTheme} />;
  }

  return (
    <div 
      className="flex h-screen w-full overflow-hidden striped-bg"
      style={{ 
        backgroundColor: currentTheme.background, 
        color: currentTheme.text,
        fontFamily: currentUser.font || 'VT323'
      }}
    >
      {viewingUser && (
        <ProfileViewer 
          user={viewingUser} 
          theme={currentTheme} 
          onClose={() => setViewingUser(null)}
          onDM={handleStartDM}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {isNpcCreatorOpen && (
          <NpcCreator 
            theme={currentTheme} 
            onClose={() => setIsNpcCreatorOpen(false)} 
            onCreate={handleCreateNPC} 
          />
      )}

      {isServerBrowserOpen && (
          <ServerBrowser 
            servers={allServers}
            joinedIds={joinedServerIds}
            theme={currentTheme}
            onClose={() => setIsServerBrowserOpen(false)}
            onJoin={handleJoinServer}
          />
      )}
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={PLAYLIST[currentSongIndex].url} 
        onEnded={() => handleMusicControl('next')}
      />

      {/* --- SERVER LIST (Far Left) --- */}
      <nav 
        className="w-16 md:w-20 border-r-2 flex flex-col items-center py-4 gap-4 z-50 overflow-y-auto"
        style={{ backgroundColor: currentTheme.panel, borderColor: currentTheme.border }}
      >
        <button
          onClick={() => {
            setActiveServerId(HOME_SERVER_ID);
            if (dmChannels.length > 0) setActiveChannelId(dmChannels[0].id);
          }}
          className={`
            relative group w-12 h-12 md:w-14 md:h-14 transition-all duration-200
            flex items-center justify-center
            ${activeServerId === HOME_SERVER_ID ? 'rounded-lg' : 'rounded-[20px] hover:rounded-lg'}
          `}
        >
           {activeServerId === HOME_SERVER_ID && (
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-8 rounded-r-xl" style={{ backgroundColor: currentTheme.text }} />
           )}
           <div 
            className={`w-full h-full flex items-center justify-center rounded-[inherit] border-2 bg-[#222] ${activeServerId === HOME_SERVER_ID ? 'border-white' : 'border-gray-600 group-hover:border-white'}`}
            style={{ borderColor: activeServerId === HOME_SERVER_ID ? currentTheme.primary : undefined }}
           >
              <Home size={28} style={{ color: activeServerId === HOME_SERVER_ID ? currentTheme.primary : 'gray' }} />
           </div>
        </button>

        <div className="w-8 h-0.5 rounded-full opacity-30 bg-current" />

        {/* Filter SERVERS by Joined IDs */}
        {allServers.filter(s => joinedServerIds.includes(s.id)).map(server => (
          <button
            key={server.id}
            onClick={() => {
              setActiveServerId(server.id);
              setActiveChannelId(server.channels[0].id);
            }}
            className={`
              relative group w-12 h-12 md:w-14 md:h-14 transition-all duration-200
              ${activeServerId === server.id ? 'rounded-lg' : 'rounded-[20px] hover:rounded-lg'}
            `}
          >
            {activeServerId === server.id && (
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-8 rounded-r-xl" style={{ backgroundColor: currentTheme.text }} />
            )}
            
            <div className={`
              w-full h-full overflow-hidden border-2 rounded-[inherit] relative
              ${activeServerId === server.id ? 'border-white' : 'border-gray-600 group-hover:border-white'}
            `} style={{ borderColor: activeServerId === server.id ? currentTheme.primary : undefined }}>
              <img src={server.icon} alt={server.name} className="w-full h-full object-cover filter contrast-125 saturate-150" />
            </div>
          </button>
        ))}

        <button 
            onClick={() => setIsServerBrowserOpen(true)}
            className="w-12 h-12 md:w-14 md:h-14 rounded-[20px] hover:rounded-lg border-2 border-dashed border-gray-600 hover:border-white flex items-center justify-center hover:bg-white/10 text-gray-500 hover:text-white transition-all"
        >
            <Plus size={24} />
        </button>
      </nav>

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed inset-y-0 left-16 md:left-0 md:relative w-64 border-r-2 flex flex-col
          transform transition-transform duration-300 ease-in-out z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ backgroundColor: currentTheme.panel, borderColor: currentTheme.border }}
      >
        <div 
          className="h-16 border-b-2 flex items-center px-4 shadow-lg"
          style={{ borderColor: currentTheme.border }}
        >
          <h1 className="text-xl font-bold truncate" style={{ color: currentTheme.secondary, textShadow: `0 0 5px ${currentTheme.secondary}` }}>
            {activeServer.name}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Section Header */}
          <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">
             {isCommunity ? "Bulletin Boards" : "Channels"}
          </div>

          {isHome && dmChannels.length === 0 && (
            <div className="text-center opacity-60 mt-10 text-lg">
              No DMs yet... <br/> Click a user in a server to chat!
            </div>
          )}
          
          {(!isHome ? activeServer.channels : dmChannels).map((channel: any) => (
            <button
              key={channel.id}
              onClick={() => {
                setActiveChannelId(channel.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full text-left px-2 py-2 flex items-center gap-2 rounded border
                hover:opacity-100 opacity-70 hover:border-dashed
                ${activeChannelId === channel.id ? 'opacity-100 border-solid font-bold' : 'border-transparent'}
              `}
              style={{ 
                backgroundColor: activeChannelId === channel.id ? (currentTheme.id === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)') : 'transparent',
                borderColor: activeChannelId === channel.id ? currentTheme.primary : 'transparent',
                color: currentTheme.text
              }}
            >
              {isHome ? <MessageCircle size={18} /> : (isCommunity ? <MessageSquare size={18} /> : <HashIcon size={18} />)}
              <span className="text-lg tracking-wide lowercase">{channel.name}</span>
            </button>
          ))}
        </div>

        {/* MUSIC PLAYER WIDGET */}
        <div className="border-y-2 p-3" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.id === 'light' ? '#eee' : 'rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Disc className={`animate-spin-slow ${isPlaying ? 'opacity-100' : 'opacity-50'}`} style={{ color: currentTheme.secondary }} size={16} />
            <div className="overflow-hidden w-full">
              <div className="whitespace-nowrap text-xs font-mono" style={{ color: currentTheme.primary }}>
                {isPlaying ? `NOW PLAYING: ${PLAYLIST[currentSongIndex].artist} - ${PLAYLIST[currentSongIndex].title}` : 'Winamp Player Stopped'}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center p-2 rounded border" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.background }}>
             <button onClick={() => handleMusicControl('prev')} className="hover:opacity-70 opacity-50"><SkipBack size={16} /></button>
             <button onClick={() => handleMusicControl(isPlaying ? 'pause' : 'play')} style={{ color: currentTheme.secondary }}>
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
             </button>
             <button onClick={() => handleMusicControl('next')} className="hover:opacity-70 opacity-50"><SkipForward size={16} /></button>
          </div>
        </div>

        {/* User Info / Controls (Bottom of Sidebar) */}
        <div className="h-14 border-t-2 flex items-center px-2 gap-2" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.panel }}>
          <div className="relative cursor-pointer" onClick={() => setViewingUser(currentUser)}>
            <Avatar user={currentUser} size="sm" />
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
            <div className="text-sm font-bold truncate hover:underline" style={{ color: currentUser.color }}>{currentUser.name}</div>
            <div className="text-xs opacity-60 truncate">{currentUser.country}</div>
          </div>
          <div className="flex gap-1">
             <button 
              className="p-1 hover:opacity-70 rounded animate-pulse" 
              style={{ color: currentTheme.primary }}
              onClick={() => setIsSettingsOpen(true)}
            >
               <Settings size={14} />
             </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Header */}
        <header 
          className="h-16 border-b-2 flex items-center justify-between px-4"
          style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.background }}
        >
          <div className="flex items-center gap-2">
            <button className="md:hidden opacity-60" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <span className="font-bold text-xl lowercase" style={{ color: currentTheme.text }}>
                {isCommunity ? `Community :: ${activeChannel.name}` : `#${activeChannel.name}`}
              </span>
              <span className="text-xs opacity-60">{activeChannel.description}</span>
            </div>
          </div>
          {isCommunity && (
            <div className="text-xs border px-2 py-1 rounded bg-yellow-400 text-black font-bold">
               MYSPACE MODE
            </div>
          )}
        </header>

        {/* COMMUNITY (MYSPACE) LAYOUT VS NORMAL CHAT */}
        {isCommunity ? (
           <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-4">
              {/* Left Col: Pseudo Profile Info */}
              <div className="w-full md:w-1/3 space-y-4">
                 <div className="border-2 p-2" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.panel }}>
                    <div className="font-bold border-b mb-2 pb-1" style={{ borderColor: currentTheme.border }}>
                       {activeServer.name}
                    </div>
                    <div className="w-full h-40 overflow-hidden mb-2">
                       <img src={activeServer.icon} className="w-full h-full object-cover" alt="server" />
                    </div>
                    <div className="text-xs opacity-80 italic">
                       "Welcome to the community! Don't forget to sign the guestbook!"
                    </div>
                 </div>

                 <div className="border-2 p-2" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.panel }}>
                    <div className="font-bold border-b mb-2 pb-1" style={{ borderColor: currentTheme.border }}>
                       Interests
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs">
                       <span className="bg-gray-700 text-white px-1">Music</span>
                       <span className="bg-gray-700 text-white px-1">HTML</span>
                       <span className="bg-gray-700 text-white px-1">Scene Hair</span>
                       <span className="bg-gray-700 text-white px-1">Invader Zim</span>
                    </div>
                 </div>

                 <div className="border-2 p-2" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.panel }}>
                    <div className="font-bold border-b mb-2 pb-1" style={{ borderColor: currentTheme.border }}>
                       Top 8 Friends
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                       {(activeServer as Server).users.slice(0, 8).map(u => (
                          <div key={u.id} className="flex flex-col items-center cursor-pointer" onClick={() => setViewingUser(u)}>
                             <div className="w-10 h-10 border border-gray-500 overflow-hidden">
                                <img src={u.avatar} className="w-full h-full object-cover" />
                             </div>
                             <span className="text-[8px] truncate w-full text-center mt-1">{u.name}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Right Col: The Chat (Styled as Comments) */}
              <div className="w-full md:w-2/3 flex flex-col">
                 <div className="font-bold text-lg mb-2" style={{ color: currentTheme.primary }}>
                    Latest Comments ({currentMessages.length})
                 </div>
                 <div className="flex-1 border-2 overflow-y-auto p-2 space-y-2 mb-2" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.background }}>
                    {currentMessages.map(msg => {
                       const user = getUser(msg.userId);
                       const isMe = msg.userId === currentUser.id;
                       return (
                          <div key={msg.id} className="flex gap-2 p-2 border-b border-dashed" style={{ borderColor: 'rgba(128,128,128,0.3)' }}>
                             <div className="w-12 flex flex-col items-center gap-1">
                                <Avatar user={user || currentUser} size="md" />
                             </div>
                             <div className="flex-1">
                                <div className="flex justify-between items-baseline bg-opacity-10 p-1" style={{ backgroundColor: currentTheme.panel }}>
                                   <span className="font-bold hover:underline cursor-pointer" style={{ color: user?.color }} onClick={() => user && setViewingUser(user)}>
                                      {user?.name}
                                   </span>
                                   <span className="text-[10px] opacity-50">{msg.timestamp}</span>
                                </div>
                                <div className="mt-1 text-sm">{msg.content}</div>
                                {msg.image && <img src={msg.image} className="mt-2 max-w-[150px] border p-1" />}
                                {msg.audio && (
                                    <div className="mt-2 flex items-center gap-2 p-2 bg-black/20 rounded border border-dashed border-gray-500">
                                       <Volume2 size={14} />
                                       <audio controls src={msg.audio} className="h-6 w-48" />
                                    </div>
                                )}
                                
                                <div className="mt-2 flex gap-2">
                                    {REACTION_OPTIONS.map(emoji => (
                                        <button 
                                            key={emoji}
                                            onClick={() => handleAddReaction(msg.id, emoji)}
                                            className={`text-[10px] px-1 border border-transparent hover:border-gray-500 ${msg.reactions?.[emoji] ? 'font-bold opacity-100' : 'opacity-40'}`}
                                        >
                                            {emoji} {msg.reactions?.[emoji] || ''}
                                        </button>
                                    ))}
                                </div>
                             </div>
                          </div>
                       )
                    })}
                    <div ref={messagesEndRef} />
                 </div>
                 
                 <div className="p-2 border-2" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.panel }}>
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                       <input 
                         className="flex-1 p-1 bg-transparent border-b outline-none" 
                         style={{ borderColor: currentTheme.text, color: currentTheme.text }}
                         placeholder="Leave a comment..."
                         value={inputText}
                         onChange={(e) => setInputText(e.target.value)}
                       />
                       <button type="submit" className="font-bold px-2 border hover:bg-white/10" disabled={isTyping}>Post</button>
                    </form>
                 </div>
              </div>
           </div>
        ) : (
          /* NORMAL CHAT LAYOUT */
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
                    <h2 className="text-4xl font-bold mb-2">Start Chatting!</h2>
                    <p>Don't be shy... rawr xD</p>
                </div>
              )}
              {currentMessages.map((msg, idx) => {
                const user = getUser(msg.userId);
                const isMe = msg.userId === currentUser.id;
                const showHeader = idx === 0 || currentMessages[idx - 1].userId !== msg.userId;

                return (
                  <div key={msg.id} className={`flex gap-3 group ${!showHeader ? 'mt-0.5' : 'mt-4'}`}>
                    {showHeader ? (
                      <div 
                        className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => user && setViewingUser(user)}
                      >
                        {user ? (
                          <Avatar user={user} size="md" />
                        ) : <div className="w-10 h-10 bg-gray-700" />}
                      </div>
                    ) : (
                      <div className="w-10 flex-shrink-0 text-[10px] opacity-0 group-hover:opacity-60 select-none pt-1 text-right">
                        {msg.timestamp}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {showHeader && (
                        <div className="flex items-baseline gap-2">
                          <span 
                            className="font-bold text-lg hover:underline cursor-pointer"
                            style={{ 
                              color: isMe ? currentUser.color : (user?.color || currentTheme.text),
                              fontFamily: user?.font || 'inherit'
                            }}
                            onClick={() => user && setViewingUser(user)}
                          >
                            {user?.name || 'Unknown'}
                          </span>
                          <span className="text-xs opacity-60">Today at {msg.timestamp}</span>
                        </div>
                      )}
                      <div className={`leading-relaxed text-lg break-words ${!showHeader ? '-mt-1' : ''}`} style={{ color: currentTheme.text }}>
                        {msg.content}
                      </div>
                      {msg.image && (
                        <div className="mt-2 max-w-sm border-2 p-1 bg-white/5" style={{ borderColor: currentTheme.secondary }}>
                          <img src={msg.image} alt="uploaded" className="max-w-full h-auto" />
                        </div>
                      )}
                      {msg.audio && (
                        <div className="mt-2 max-w-sm flex items-center gap-2 p-2 rounded border border-dashed bg-black/10" style={{ borderColor: currentTheme.secondary }}>
                            <Volume2 size={16} />
                            <audio controls src={msg.audio} className="h-8 w-full" />
                        </div>
                      )}
                      
                      {/* REACTIONS BAR */}
                      <div className="flex items-center gap-1 mt-1 opacity-60 hover:opacity-100 transition-opacity">
                        {REACTION_OPTIONS.map(emoji => (
                             msg.reactions?.[emoji] ? (
                                <button 
                                    key={emoji}
                                    onClick={() => handleAddReaction(msg.id, emoji)}
                                    className="px-1.5 py-0.5 text-xs bg-white/10 rounded border border-white/20 hover:bg-white/20 flex gap-1"
                                >
                                    <span>{emoji}</span>
                                    <span className="font-bold">{msg.reactions[emoji]}</span>
                                </button>
                             ) : null
                        ))}
                        
                        <div className="relative group/add">
                             <button className="px-1.5 py-0.5 text-xs hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                 +
                             </button>
                             <div className="absolute left-0 bottom-full mb-1 hidden group-hover/add:flex bg-black border p-1 rounded gap-1 z-10 shadow-lg">
                                {REACTION_OPTIONS.map(emoji => (
                                    <button 
                                        key={emoji}
                                        onClick={() => handleAddReaction(msg.id, emoji)}
                                        className="hover:bg-white/20 px-1 rounded whitespace-nowrap"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                             </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex gap-3 mt-4 animate-pulse opacity-70">
                    <div className="w-10 h-10 bg-white/10 border border-gray-700"></div>
                    <div className="flex flex-col gap-1 pt-2">
                      <div className="w-24 h-4 bg-white/10 rounded"></div>
                      <div className="w-48 h-4 bg-white/10 rounded"></div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4" style={{ backgroundColor: currentTheme.background }}>
              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 border-2 p-2 relative"
                style={{ 
                  borderColor: isTyping ? currentTheme.primary : currentTheme.border,
                  backgroundColor: currentTheme.id === 'light' ? '#fff' : 'rgba(0,0,0,0.2)'
                }}
              >
                {(activeServer as Server).allowImages && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 opacity-60 hover:opacity-100 transition-colors"
                    >
                      <Camera size={20} className="hover:scale-110 transition-transform" style={{ color: currentTheme.secondary }}/>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                    />
                  </>
                )}

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message #${activeChannel.name}`}
                  className="flex-1 bg-transparent border-none outline-none placeholder-opacity-60 text-lg"
                  style={{ color: currentTheme.text, fontFamily: currentUser.font || 'inherit' }}
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || isTyping}
                  className={`p-2 transition-all ${inputText.trim() ? 'opacity-100' : 'opacity-50'}`}
                >
                  <Send size={20} style={{ color: inputText.trim() ? currentTheme.primary : 'gray' }} />
                </button>
              </form>
              <div className="text-[10px] opacity-60 mt-1 flex justify-between">
                <span>* RAWRChat v4.0 *</span>
                <span>Press Enter to send</span>
              </div>
            </div>
          </>
        )}
      </main>

      {/* --- USER LIST (Right Sidebar) --- */}
      {!isHome && !isCommunity && (
        <aside 
          className="hidden lg:flex w-60 border-l-2 flex-col"
          style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.panel }}
        >
          <div className="h-16 border-b-2 flex items-center px-4 justify-between" style={{ borderColor: currentTheme.border }}>
             <span className="opacity-80 font-bold uppercase tracking-widest text-sm text-green-500 animate-pulse">
                Online - {(activeServer as Server).users.length}
             </span>
             <button onClick={() => setIsNpcCreatorOpen(true)} className="p-1 hover:text-white text-gray-400" title="Create NPC">
                <UserPlus size={18} />
             </button>
          </div>
          
          <div className="p-3 space-y-4 overflow-y-auto flex-1">
            {/* Group: Online */}
            <div>
              <div className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: currentTheme.secondary }}>
                {(activeServer as Server).type === 'human' ? 'Global Users' : 'Scene Queens & Kings'}
              </div>
              <div className="space-y-1">
                {(activeServer as Server).users.map(user => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer group relative"
                    onClick={() => setViewingUser(user)}
                  >
                    <Avatar user={user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base truncate" style={{ color: user.color, fontFamily: user.font }}>{user.name}</div>
                      <div className="text-xs opacity-60 truncate">
                          {user.isBot ? user.personality : 'Online'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* --- SETTINGS MODAL --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div 
            className="w-full max-w-4xl border-2 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] flex flex-col md:flex-row h-[600px]"
            style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.text }}
          >
            
            {/* Sidebar */}
            <div className="w-full md:w-48 border-b-2 md:border-b-0 md:border-r-2 p-4 flex flex-col gap-2" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.panel }}>
              <h2 className="text-xl font-bold mb-4 uppercase tracking-widest text-center md:text-left" style={{ color: currentTheme.primary }}>Settings xD</h2>
              <button 
                onClick={() => setSettingsTab('profile')}
                className={`text-left px-3 py-2 rounded border ${settingsTab === 'profile' ? `bg-white/10` : 'border-transparent opacity-60 hover:bg-white/5'}`}
                style={{ borderColor: settingsTab === 'profile' ? currentTheme.primary : 'transparent' }}
              >
                <div className="flex items-center gap-2"><UserIcon size={16}/> Profile</div>
              </button>
              <button 
                 onClick={() => setSettingsTab('theme')}
                 className={`text-left px-3 py-2 rounded border ${settingsTab === 'theme' ? `bg-white/10` : 'border-transparent opacity-60 hover:bg-white/5'}`}
                 style={{ borderColor: settingsTab === 'theme' ? currentTheme.primary : 'transparent' }}
              >
                <div className="flex items-center gap-2"><Palette size={16}/> Skins</div>
              </button>
              
              <button 
                onClick={() => {
                    setIsSettingsOpen(false);
                    setIsNpcCreatorOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-green-400 hover:bg-green-900/20 rounded transition-colors text-left"
              >
                <UserPlus size={16} /> Create NPC
              </button>

              <div className="flex-1" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-900/20 rounded transition-colors"
              >
                <LogOut size={16} /> Log Out
              </button>
              <button onClick={() => setIsSettingsOpen(false)} className="md:hidden w-full text-center py-2 bg-red-900/20 text-red-500 border border-red-900">
                Close
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 relative overflow-y-auto" style={{ backgroundColor: currentTheme.background }}>
               <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="absolute top-4 right-4 opacity-60 hover:opacity-100"
               >
                 <X size={24} />
               </button>

               {settingsTab === 'profile' && (
                 <div className="animate-in fade-in duration-200">
                   <h3 className="text-2xl font-bold mb-6 border-b pb-2" style={{ borderColor: currentTheme.border }}>
                     Total Profile Makeover
                   </h3>
                   
                   <form onSubmit={handleSaveProfile} className="space-y-6">
                      
                      {/* Banner & Avatar Preview */}
                      <div className="relative group mb-12">
                         <div className="h-32 w-full border-2 overflow-hidden relative" style={{ borderColor: currentTheme.secondary }}>
                           <img src={currentUser.banner || 'https://picsum.photos/seed/banner/600/200'} alt="Banner" className="w-full h-full object-cover filter contrast-125 saturate-150 sepia-[0.3]" />
                           <button 
                            type="button" 
                            onClick={() => profileBannerInputRef.current?.click()}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                           >
                             <Edit size={24} /> Change Banner
                           </button>
                         </div>
                         <div className="absolute -bottom-10 left-6 w-24 h-24 group">
                           <Avatar user={currentUser} size="lg" />
                           <button 
                             type="button" 
                             onClick={() => profileAvatarInputRef.current?.click()}
                             className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity rounded-full"
                           >
                              <Camera size={20} />
                           </button>
                         </div>
                         <input type="file" ref={profileBannerInputRef} className="hidden" onChange={(e) => handleProfileImageUpload(e, 'banner')} accept="image/*" />
                         <input type="file" ref={profileAvatarInputRef} className="hidden" onChange={(e) => handleProfileImageUpload(e, 'avatar')} accept="image/*" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div>
                          <label className="block opacity-60 text-sm mb-1 uppercase">Display Name</label>
                          <input 
                            name="username"
                            defaultValue={currentUser.name}
                            className="w-full border p-2 outline-none text-xl"
                            style={{ backgroundColor: currentTheme.panel, borderColor: currentTheme.border, color: currentTheme.text, fontFamily: currentUser.font }}
                          />
                        </div>

                        <div>
                          <label className="block opacity-60 text-sm mb-1 uppercase">Name Color</label>
                          <div className="flex gap-2">
                             <input 
                                type="color" 
                                name="color"
                                defaultValue={currentUser.color}
                                className="w-full h-10 bg-transparent border cursor-pointer"
                                style={{ borderColor: currentTheme.border }}
                             />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                          <label className="block opacity-60 text-sm mb-2 uppercase flex items-center gap-2">
                             <Type size={14} /> Font Style
                          </label>
                          <select 
                            value={currentUser.font}
                            onChange={(e) => setCurrentUser(prev => ({ ...prev, font: e.target.value }))}
                            className="w-full p-2 border outline-none"
                            style={{ backgroundColor: currentTheme.panel, borderColor: currentTheme.border, color: currentTheme.text }}
                          >
                             {FONT_OPTIONS.map(font => (
                               <option key={font.id} value={font.family}>{font.name}</option>
                             ))}
                          </select>
                         </div>
                         <div>
                          <label className="block opacity-60 text-sm mb-2 uppercase flex items-center gap-2">
                             <Sparkles size={14} /> Avatar Frame
                          </label>
                          <select 
                            name="frame"
                            defaultValue={currentUser.frame}
                            className="w-full p-2 border outline-none"
                            style={{ backgroundColor: currentTheme.panel, borderColor: currentTheme.border, color: currentTheme.text }}
                          >
                             {FRAME_OPTIONS.map(frame => (
                               <option key={frame.id} value={frame.id}>{frame.name}</option>
                             ))}
                          </select>
                         </div>
                      </div>

                      <div>
                        <label className="block opacity-60 text-sm mb-1 uppercase">About Me</label>
                        <textarea 
                          name="bio"
                          defaultValue={currentUser.bio}
                          rows={3}
                          className="w-full border p-2 outline-none text-lg"
                          style={{ backgroundColor: currentTheme.panel, borderColor: currentTheme.border, color: currentTheme.text, fontFamily: currentUser.font }}
                        />
                      </div>

                      <div className="pt-4 flex justify-end border-t" style={{ borderColor: currentTheme.border }}>
                        <button type="submit" className="flex items-center gap-2 font-bold px-8 py-3 border-2 shadow-[4px_4px_0_0_rgba(255,255,255,0.5)] active:translate-y-1 active:shadow-none transition-all"
                           style={{ backgroundColor: currentTheme.primary, color: currentTheme.id === 'light' ? 'white' : 'black', borderColor: 'currentColor' }}
                        >
                          <Save size={18} /> SAVE CHANGES
                        </button>
                      </div>
                   </form>
                 </div>
               )}

               {settingsTab === 'theme' && (
                 <div className="animate-in fade-in duration-200">
                    <h3 className="text-2xl font-bold mb-6 border-b pb-2" style={{ borderColor: currentTheme.border }}>
                      Visual Style
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {SCENE_THEMES.map(theme => (
                         <button
                           key={theme.id}
                           onClick={() => setCurrentTheme(theme)}
                           className={`p-4 border-2 text-left relative overflow-hidden transition-all hover:scale-[1.02] ${currentTheme.id === theme.id ? 'ring-2 ring-current' : ''}`}
                           style={{ 
                             backgroundColor: theme.background, 
                             borderColor: theme.border,
                             color: theme.text
                           }}
                         >
                            <div className="relative z-10">
                              <h4 className="text-xl font-bold mb-1" style={{ color: theme.primary }}>{theme.name}</h4>
                              <div className="flex gap-2 mt-2">
                                <div className="w-6 h-6 border border-white" style={{ backgroundColor: theme.primary }} />
                                <div className="w-6 h-6 border border-white" style={{ backgroundColor: theme.secondary }} />
                                <div className="w-6 h-6 border border-white" style={{ backgroundColor: theme.panel }} />
                              </div>
                            </div>
                            <div className="absolute top-0 right-0 w-16 h-16 opacity-20 transform rotate-45 translate-x-8 -translate-y-8" style={{ backgroundColor: theme.secondary }} />
                         </button>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
