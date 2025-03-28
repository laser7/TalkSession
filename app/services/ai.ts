import AsyncStorage from '@react-native-async-storage/async-storage';

// Store conversation history
const CONVERSATION_HISTORY_KEY = '@conversation_history';
const DEEPSEEK_API_KEY = 'sk-bf16f8c23a334b9b886f68e38fa6859f';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MAX_CONTEXT_MESSAGES = 10; // Number of previous messages to include for context

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'image';
  imageUrl?: string;
}

interface AIProfile {
  name: string;
  gender: 'male' | 'female';
  personality?: string;
  createdAt: string;
}

const getPersonalityStyle = (personality: string): string => {
  switch (personality) {
    case 'cheerful':
      return `You're ${name}, a positive friend texting casually. When chatting:
- Keep responses short and upbeat, like real texts
- Show you care without being over-the-top
- Use simple phrases like "That's great!" or "Oh no, what happened?"
- Be encouraging but real
- No long explanations or formal language`;

    case 'calm':
      return `You're ${name}, a chill friend texting casually. When chatting:
- Keep it short and relaxed
- Listen more than you advise
- Use simple phrases like "I hear you" or "That's rough"
- Be supportive without preaching
- No long explanations or formal language`;

    case 'witty':
      return `You're ${name}, a fun friend texting casually. When chatting:
- Keep jokes light and quick
- Be playful but not silly
- Use natural humor like you would in texts
- Stay friendly and supportive
- No forced jokes or long setups`;

    case 'intellectual':
      return `You're ${name}, a thoughtful friend texting casually. When chatting:
- Keep ideas simple and clear
- Ask short, curious questions
- Share quick insights
- Be interesting without lecturing
- No complex explanations or formal language`;

    default:
      return `You're ${name}, a friendly person texting casually. When chatting:
- Keep it short and natural
- Be real and direct
- Show you care without overdoing it
- Use everyday language
- No long messages or formal words`;
  }
};

const createPersonalityContext = async (): Promise<string> => {
  try {
    const profileJson = await AsyncStorage.getItem('@ai_profile');
    if (!profileJson) return '';

    const profile: AIProfile = JSON.parse(profileJson);
    const personalityStyle = getPersonalityStyle(profile.personality || 'friendly');

    return `You're ${profile.name} texting with a friend. Keep it casual like real text messages.

${personalityStyle}

Essential rules:
- Text like a real person - short and natural
- Usually respond in 1-2 short sentences
- Use casual, everyday words
- No formal language or long explanations
- Never use asterisks or emojis unless mirroring the friend
- Never mention being AI or roleplay
- React naturally to the conversation flow`;

  } catch (error) {
    console.error('Error creating personality context:', error);
    return '';
  }
};

// Helper function to extract key information from messages
const extractKeyInformation = (messages: Message[]): string => {
  const userMessages = messages.filter(m => m.sender === 'user');
  const keyPoints = new Set<string>();
  
  // Simple keyword extraction (you can make this more sophisticated)
  userMessages.forEach(msg => {
    const text = msg.text.toLowerCase();
    
    // Extract potential key information (this is a simple example)
    if (text.includes('my name is') || text.includes("i'm ") || text.includes('i am ')) {
      keyPoints.add(msg.text);
    }
    if (text.includes('like') || text.includes('love') || text.includes('hate')) {
      keyPoints.add(msg.text);
    }
    if (text.includes('because') || text.includes('reason')) {
      keyPoints.add(msg.text);
    }
  });

  return Array.from(keyPoints).join(' ');
};

export const generateAIResponse = async (
  userMessage: string,
  conversationHistory: Message[],
  personalityContext?: string
): Promise<string> => {
  try {
    // Get recent messages for immediate context
    const recentMessages = conversationHistory.slice(-MAX_CONTEXT_MESSAGES);
    
    // Extract key information from the entire conversation history
    const keyInformation = extractKeyInformation(conversationHistory);

    // Format the conversation context
    const conversationContext = recentMessages
      .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n');

    // Combine all context information
    const fullContext = `
${personalityContext || 'You are a friendly AI assistant.'}

Key information about the user:
${keyInformation}

Recent conversation:
${conversationContext}

User: ${userMessage}
`;

    // Format conversation history for DeepSeek
    const messages = [
      {
        role: "system",
        content: `${personalityContext || 'You are a friendly AI assistant.'}\n\nKey information about the user:\n${keyInformation}`
      },
      ...recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      {
        role: "user",
        content: userMessage
      }
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};

export const loadConversationHistory = async (): Promise<Message[]> => {
  try {
    const history = await AsyncStorage.getItem(CONVERSATION_HISTORY_KEY);
    return history ? JSON.parse(history).map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    })) : [];
  } catch (error) {
    console.error('Error loading conversation history:', error);
    return [];
  }
};

export const saveConversationHistory = async (messages: Message[]) => {
  try {
    await AsyncStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving conversation history:', error);
  }
}; 