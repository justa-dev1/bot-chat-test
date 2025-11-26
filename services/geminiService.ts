import { GoogleGenAI } from "@google/genai";
import { Message, User } from '../types';

/**
 * Selects a random bot from the list of users (excluding the current user)
 * and generates a response based on the chat context.
 */
export const generateBotResponse = async (
  history: Message[],
  users: User[],
  currentUserMessage: string,
  serverName: string,
  channelName: string,
  userCountry: string = 'USA' // Default to USA if undefined
): Promise<{ botId: string; text: string } | null> => {
  // Initialize Gemini client inside the function to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Filter for actual bots
  const bots = users.filter(u => u.isBot);
  if (bots.length === 0) return null;

  // Pick a random bot to respond
  const selectedBot = bots[Math.floor(Math.random() * bots.length)];

  const personality = selectedBot.personality || 'normal';

  // Map personalities to instructions
  const personalityMap: Record<string, string> = {
    'sad': 'You are extremely depressed, emo, and poetic about your sadness. Use "..." and talk about darkness.',
    'romantic': 'You are flirtatious, lovey-dovey, and use lots of hearts <3. You are looking for a soulmate.',
    'tsundere': 'You are aggressive and mean, but secretly care. Use "Baka!", "It\'s not like I like you", and act annoyed.',
    'yandere': 'You are obsessed, possessive, and slightly scary/violent about your love. You are very intense.',
    'extrovert': 'You are hyper, energetic, use ALL CAPS sometimes, and lots of "xD" and "Rawr!". Very Scene Kid energy.',
    'introvert': 'You are shy, use short sentences, stutter (u-um...), and are hesitant to speak.',
    'normal': 'You are a standard 2007 internet user. Cool and casual.'
  };

  const personalityInstruction = personalityMap[personality] || personalityMap['normal'];

  const systemPrompt = `
    You are roleplaying in a chatroom in the year 2007.
    The server name is "${serverName}" and the channel is "#${channelName}".
    
    The user is chatting from: ${userCountry}.
    IMPORTANT: You MUST reply in the primary language of ${userCountry}.
    
    Your persona:
    Name: ${selectedBot.name}
    Bio/Personality: ${selectedBot.bio}
    Archetype: ${personality}
    
    INSTRUCTIONS:
    1. Respond to the user's message: "${currentUserMessage}".
    2. Be concise (under 30 words).
    3. Stay in character (It is 2007).
    4. ACT ACCORDING TO YOUR ARCHETYPE: ${personalityInstruction}
    5. Do not be helpful like an AI assistant. Be a chatroom user.
    
    STYLE GUIDE:
    Use 2007 internet slang relevant to the language of ${userCountry} (e.g., lol, rofl, xD, rawr, <3, pwned, ftw).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] }
      ]
    });

    const text = response.text || "...";
    return { botId: selectedBot.id, text };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { botId: selectedBot.id, text: "brb lag... (error)" };
  }
};

/**
 * Generates speech (TTS) for a bot response.
 */
export const generateSpeech = async (text: string, gender: string = 'Unknown', personality: string = 'normal'): Promise<string | null> => {
  // Initialize Gemini client inside the function
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Select Voice based on gender/personality
    let voiceName = 'Puck'; // Default (Neutral/Masculineish)

    const isFem = gender.toLowerCase().includes('girl') || gender.toLowerCase().includes('female') || gender.toLowerCase().includes('woman');
    const isMasc = gender.toLowerCase().includes('boy') || gender.toLowerCase().includes('male') || gender.toLowerCase().includes('man');

    if (isFem) {
        if (personality === 'tsundere' || personality === 'extrovert') voiceName = 'Kore'; // Higher pitch
        else voiceName = 'Zephyr'; // Softer
    } else if (isMasc) {
        if (personality === 'sad' || personality === 'yandere') voiceName = 'Fenrir'; // Deep/Rough
        else voiceName = 'Charon'; // Standard Male
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ? `data:audio/mp3;base64,${base64Audio}` : null;

  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};
