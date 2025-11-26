
export interface User {
  id: string;
  name: string;
  avatar: string;
  banner?: string; 
  status: 'online' | 'idle' | 'dnd' | 'offline';
  color: string;
  isBot: boolean;
  bio?: string;
  font?: string; 
  // Registration fields
  age?: string;
  gender?: string;
  country?: string;
  // New features
  frame?: string; // 'leopard', 'bow', 'cat', 'angel', 'none'
  personality?: 'sad' | 'romantic' | 'tsundere' | 'yandere' | 'extrovert' | 'introvert' | 'normal';
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  image?: string;
  audio?: string; // Base64 audio string
  reactions?: Record<string, number>; // key: emoji, value: count
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'dm';
  description?: string;
  participants?: string[]; 
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  channels: Channel[];
  users: User[];
  allowImages: boolean; 
  type?: 'bot' | 'human' | 'community'; // Added community type
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
}

export interface Theme {
  id: string;
  name: string;
  primary: string;   
  secondary: string; 
  background: string; 
  panel: string;     
  text: string;
  border: string;
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
}

export interface FrameOption {
  id: string;
  name: string;
  cssClass: string;
  overlay?: string; // Emoji or visual overlay
}