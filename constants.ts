
import { Server, User, Song, Theme, FontOption, FrameOption } from './types';

// Specific Scene/Emo images provided by user
export const SCENE_AVATARS = [
  "https://i.pinimg.com/736x/5b/3f/55/5b3f55eb51bfede55fbd71f0baee9e28.jpg",
  "https://i.pinimg.com/736x/2c/73/0a/2c730a5d03737217f7c4da105c926343.jpg",
  "https://i.pinimg.com/736x/4d/87/0e/4d870ec5daf688a041e996860c47e646.jpg",
  "https://i.pinimg.com/736x/27/c8/57/27c85722f6425f06b4874f9a8ad6c03d.jpg",
  "https://i.pinimg.com/736x/4f/a5/97/4fa5976817f38b6be6c27d2dbeebeae1.jpg",
  "https://i.pinimg.com/736x/9e/e7/74/9ee77436080f154bb054e41941d88a37.jpg",
  "https://i.pinimg.com/736x/46/3a/8f/463a8fa1281d0042b7ea098c6f684e74.jpg",
  "https://i.pinimg.com/736x/8f/b2/6e/8fb26ee8ebd7b1cf70b6f8365e8d2afd.jpg"
];

const getRandomAvatar = () => SCENE_AVATARS[Math.floor(Math.random() * SCENE_AVATARS.length)];

export const FRAME_OPTIONS: FrameOption[] = [
  { id: 'none', name: 'No Frame', cssClass: '' },
  { id: 'leopard', name: 'Pink Leopard', cssClass: 'border-4 border-pink-500 border-dashed ring-2 ring-black' },
  { id: 'bow', name: 'Giant Bow', cssClass: 'border-2 border-pink-300', overlay: '🎀' },
  { id: 'cat', name: 'Cat Ears', cssClass: 'border-2 border-white', overlay: '🐱' },
  { id: 'angel', name: 'Angel Wings', cssClass: 'ring-2 ring-white shadow-[0_0_15px_white]', overlay: '👼' },
  { id: 'emo', name: 'Broken Heart', cssClass: 'border-4 border-gray-800 border-double', overlay: '💔' },
  { id: 'star', name: 'Super Star', cssClass: 'border-2 border-yellow-400', overlay: '⭐' },
  { id: 'crown', name: 'Queen/King', cssClass: 'border-2 border-purple-500', overlay: '👑' },
];

export const PERSONALITIES = ['sad', 'romantic', 'tsundere', 'yandere', 'extrovert', 'introvert', 'normal'] as const;

export const REACTION_OPTIONS = ['<3', 'xD', 'o_O', '>:(', 'lol', ':3', 'rawr'];

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Guest',
  avatar: SCENE_AVATARS[0],
  banner: 'https://picsum.photos/seed/banner/600/200',
  status: 'online',
  color: '#ffffff',
  isBot: false,
  bio: 'New to the scene. xD',
  font: 'VT323',
  country: 'USA',
  frame: 'none',
  personality: 'normal'
};

const createBot = (id: string, name: string, color: string, bio: string, bannerSeed: string, fixedPersonality?: string): User => {
  const personality = fixedPersonality || PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
  const frame = FRAME_OPTIONS[Math.floor(Math.random() * (FRAME_OPTIONS.length - 1)) + 1].id; 
  
  return {
    id,
    name,
    avatar: getRandomAvatar(),
    banner: `https://picsum.photos/seed/${bannerSeed}/600/200`,
    status: 'online',
    color,
    isBot: true,
    bio,
    font: 'VT323',
    personality: personality as any,
    frame
  };
};

// --- BOT GENERATOR ---
const NAMES_PREFIX = ['xX', 'Lil', 'Emo', 'Scene', 'Dark', 'Rawr', 'Miss', 'Mr', 'Captain', 'Lady', 'iAm'];
const NAMES_ROOT = ['Killa', 'Panda', 'Cupcake', 'Vampire', 'Ghost', 'Zombie', 'Glitch', 'Star', 'Sk8r', 'Wolf', 'Ninja', 'Monster', 'Kitty', 'Dino', 'Taco', 'Invader', 'Rave', 'Slash', 'Blade'];
const NAMES_SUFFIX = ['Xx', '_xD', '_666', '_rawr', '_uwu', '_o_O', '_1337', '_luv', '_xoxo'];
const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#aaaaaa', '#ff9900', '#cc00cc'];

const generateRandomBots = (count: number, startId: number): User[] => {
  const bots: User[] = [];
  for (let i = 0; i < count; i++) {
    const prefix = NAMES_PREFIX[Math.floor(Math.random() * NAMES_PREFIX.length)];
    const root = NAMES_ROOT[Math.floor(Math.random() * NAMES_ROOT.length)];
    const suffix = NAMES_SUFFIX[Math.floor(Math.random() * NAMES_SUFFIX.length)];
    const name = `${prefix}_${root}${suffix}`;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    bots.push(createBot(
      `gen_${startId + i}`,
      name,
      color,
      `Just a ${root} living in a ${prefix} world.`,
      `banner_${startId + i}`
    ));
  }
  return bots;
};

// Generate 50 extra bots
const EXTRA_BOTS = generateRandomBots(50, 100);

// Helper to distribute bots
const distributeBots = (serverIndex: number) => {
  const botsPerServer = Math.floor(EXTRA_BOTS.length / 5);
  return EXTRA_BOTS.slice(serverIndex * botsPerServer, (serverIndex + 1) * botsPerServer);
};

export const SERVERS: Server[] = [
  {
    id: 'nightlov',
    name: 'NightLov ☾',
    icon: 'https://i.pinimg.com/736x/7d/5a/27/7d5a278913cb9045ba772719624597d3.jpg', 
    allowImages: true,
    type: 'bot',
    channels: [
      { id: 'nl1', name: 'insomnia', type: 'text', description: 'For those who never sleep...' },
      { id: 'nl2', name: 'broken-hearts', type: 'text', description: 'Venting space </3' },
      { id: 'nl3', name: 'poetry', type: 'text', description: 'Dark rhymes only.' },
    ],
    users: [
      createBot('n1', 'Midnight_Kizz', '#aa00aa', 'Loves the moon and black eyeliner.', 'moon', 'sad'),
      createBot('n2', 'X_Vampy_X', '#ff0000', 'Vampire aesthetics only.', 'blood', 'yandere'),
      createBot('n3', 'Ghost_In_The_Machine', '#ccffcc', 'I am not real.', 'ghost', 'introvert'),
      ...distributeBots(0)
    ]
  },
  {
    id: 'weblov',
    name: 'WebLov <3',
    icon: 'https://i.pinimg.com/236x/52/64/00/526400627546761427181283d69c7659.jpg',
    allowImages: true,
    type: 'bot',
    channels: [
      { id: 'wl1', name: 'dating-profiles', type: 'text', description: 'Post ur age/loc/pic xD' },
      { id: 'wl2', name: 'main-chat', type: 'text', description: 'Couples and drama here.' },
      { id: 'wl3', name: 'breakups', type: 'text', description: 'Who broke up with who??' },
    ],
    users: [
      createBot('w1', 'L0ver_B0y', '#00ccff', 'Dating Tsundere_Queen. I love her even if she is mean.', 'love', 'romantic'),
      createBot('w2', 'Tsundere_Queen', '#ff66aa', 'Dating L0ver_B0y. He is annoying (but i love him).', 'tsun', 'tsundere'),
      createBot('w3', 'Heart_Breaker', '#660000', 'Single. I want to steal L0ver_B0y. I hate happy couples.', 'broken', 'yandere'),
      createBot('w4', 'Emo_Loner', '#555555', 'Forever alone... just watching the drama.', 'loner', 'sad'),
      ...distributeBots(1)
    ]
  },
  {
    id: 'scenespace',
    name: 'Scene Space',
    icon: 'https://i.pinimg.com/736x/44/2c/3d/442c3d0b26391d471550c6046aa33439.jpg',
    allowImages: true,
    type: 'community',
    channels: [
      { id: 'ss1', name: 'General Bulletin', type: 'text', description: 'Public Wall Posts' },
      { id: 'ss2', name: 'Rate My Fit', type: 'text', description: 'PC4PC (Pic for Pic)' },
      { id: 'ss3', name: 'Music Codes', type: 'text', description: 'HTML codes for ur profile' },
    ],
    users: [
      createBot('ss1', 'Tom_M', '#ffffff', 'Everyone\'s first friend.', 'myspace', 'extrovert'),
      createBot('ss2', 'Scene_King', '#00ff00', 'I run this place.', 'crown', 'extrovert'),
      createBot('ss3', 'Glitch_Grl', '#ff00ff', 'Coding queen.', 'code', 'introvert'),
      createBot('ss4', 'RaWr_Zomb1e', '#aaaaaa', 'Brains... and cupcakes.', 'zombie', 'normal'),
      ...distributeBots(2)
    ]
  },
  {
    id: 's1',
    name: 'Rawr Corner xD',
    icon: 'https://picsum.photos/seed/rawr/50/50',
    allowImages: true,
    type: 'bot',
    channels: [
      { id: 'c1', name: 'general', type: 'text', description: 'Chat about anything! Rawr!' },
      { id: 'c2', name: 'music-n-bands', type: 'text', description: 'MCR, Paramore, FOB <3' },
      { id: 'c3', name: 'selfiez', type: 'text', description: 'Post ur hair pics!!' },
    ],
    users: [
      createBot('u1', 'xX_DarkAngel_Xx', '#ff0000', 'You are a moody emo kid. You love MCR.', 'dark', 'sad'),
      createBot('u2', 'Neon_Glitch', '#00ff00', 'You are a scene kid. You love raves and Invader Zim.', 'neon', 'extrovert'),
      createBot('u3', 'SadBoy2005', '#6666ff', 'You are quiet and mysterious.', 'rain', 'introvert'),
      ...distributeBots(3)
    ],
  },
  {
    id: 's3',
    name: 'Earth Link [HUMANS]',
    icon: 'https://picsum.photos/seed/earth/50/50',
    allowImages: true,
    type: 'human',
    channels: [
      { id: 'c6', name: 'global-chat', type: 'text', description: 'Real humans only!! No bots allowed.' },
      { id: 'c7', name: 'dating', type: 'text', description: 'Find ur soulmate <3' },
    ],
    users: [
      createBot('h1', 'Sk8r_Boi', '#ff9900', 'You are a chill skater guy. You act like a real person.', 'skate', 'extrovert'),
      createBot('h2', 'EmoPrincess', '#ff66cc', 'You are looking for friends. You act like a real person.', 'pink', 'extrovert'),
      createBot('h3', 'TrollFace', '#ffffff', 'You like to prank people slightly. You act like a real person.', 'troll', 'extrovert'),
      createBot('h4', 'MusicLover99', '#00ccff', 'You share mp3 links. You act like a real person.', 'music', 'normal'),
      ...distributeBots(4)
    ],
  },
];

// Special pseudo-server for DMs
export const HOME_SERVER_ID = 'home';

export const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome',
  userId: 'u1',
  content: 'Welcome to RawrChat... <3 Log in and set up ur profile!',
  timestamp: '10:00 AM',
  reactions: { '<3': 2, 'xD': 5 }
};

// Updated Playlist with Scene Hits
export const PLAYLIST: Song[] = [
  {
    id: 'track1',
    title: 'Girlfriend',
    artist: 'Avril Lavigne',
    duration: '3:37',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_1e5950d6f9.mp3' 
  },
  {
    id: 'track2',
    title: 'Alcohol',
    artist: 'Millionaires',
    duration: '3:05',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/21/audio_345155f306.mp3' 
  },
  {
    id: 'track3',
    title: 'Freaxxx',
    artist: 'Brokencyde',
    duration: '3:50',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3' 
  },
  {
    id: 'track4',
    title: 'Fergalicious',
    artist: 'Fergie',
    duration: '4:52',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3'
  },
  {
    id: 'track5',
    title: 'Vacation Bible School',
    artist: 'Ayesha Erotica',
    duration: '2:58',
    url: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3' 
  }
];

export const SCENE_THEMES: Theme[] = [
  {
    id: 'classic',
    name: 'Rawr xD (Default)',
    primary: '#ff00ff', // Hot Pink
    secondary: '#00ffff', // Cyan
    background: '#000000',
    panel: '#111111',
    text: '#ffffff',
    border: '#333333'
  },
  {
    id: 'light',
    name: 'Rawr Light (Blinding)',
    primary: '#ff00aa', // Deep Pink
    secondary: '#000000', // Black
    background: '#ffffff',
    panel: '#f0f0f0',
    text: '#000000',
    border: '#ff00aa'
  },
  {
    id: 'toxic',
    name: 'Toxic Waste',
    primary: '#00ff00', // Lime
    secondary: '#ff00ff', // Pink
    background: '#050a05',
    panel: '#0a140a',
    text: '#ccffcc',
    border: '#004400'
  },
  {
    id: 'gir',
    name: 'Gir\'s Cupcake',
    primary: '#aa00ff', // Purple
    secondary: '#00ff00', // Lime
    background: '#1a051a',
    panel: '#2d0a2d',
    text: '#ffccff',
    border: '#aa00ff'
  },
  {
    id: 'hottopic',
    name: 'Mall Goth',
    primary: '#ff0000', // Red
    secondary: '#ffffff', // White
    background: '#000000',
    panel: '#1a0000',
    text: '#ffffff',
    border: '#660000'
  }
];

export const FONT_OPTIONS: FontOption[] = [
  { id: 'vt323', name: 'Terminal (Default)', family: '"VT323", monospace' },
  { id: 'starborn', name: 'Starborn (Glitch)', family: '"Rubik Glitch", system-ui' },
  { id: 'pixel', name: '8-Bit', family: '"Press Start 2P", cursive' },
  { id: 'comic', name: 'Toon', family: '"Bangers", system-ui' },
  { id: 'creepy', name: 'Vampire', family: '"Creepster", system-ui' },
  { id: 'arial', name: 'Boring', family: 'Arial, sans-serif' },
];
