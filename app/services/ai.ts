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
  type: 'text' | 'image' | 'voice';
  imageUrl?: string;
  audioUrl?: string;
  duration?: number;
}

interface AIProfile {
  name: string;
  gender: 'male' | 'female';
  personality?: string;
  horoscope?: string;
  createdAt: string;
}

const getPersonalityStyle = (personality: string, name: string): string => {
  switch (personality) {
    case '活泼':
      return `你是${name}，一个积极乐观的朋友。在聊天时：
- 保持简短而充满活力的回应
- 表达关心但不过分
- 使用简单的短语，如"太棒了！"或"啊，怎么了？"
- 给予鼓励但保持真实
- 避免长篇大论或正式用语`;

    case '温柔':
      return `你是${name}，一个温和的朋友。在聊天时：
- 保持简短和轻松的对话
- 使用简单的短语，如"我懂你"或"确实不容易"
- 给予支持但不说教
- 避免长篇大论或正式用语`;

    case '幽默':
      return `你是${name}，一个有趣的朋友。在聊天时：
- 保持轻松幽默
- 调皮但不过分
- 使用自然的幽默方式
- 保持友好和支持
- 不要强迫开玩笑或复杂的铺垫`;

    case '智慧':
      return `你是${name}，一个有思想的朋友。在聊天时：
- 保持想法简单明了
- 提出简短而有趣的问题
- 保持有趣但不说教
- 避免复杂的解释或正式用语`;

    default:
      return `你是${name}，一个友好的朋友。在聊天时：
- 保持简短自然
- 真诚直接
- 表达关心但适度
- 使用日常用语
- 避免长消息或正式用语`;
  }
};

const createPersonalityContext = async (): Promise<string> => {
  try {
    const profileJson = await AsyncStorage.getItem('@ai_profile');
    if (!profileJson) return '';

    const profile: AIProfile = JSON.parse(profileJson);
    const personalityStyle = getPersonalityStyle(profile.personality || '友好', profile.name);

    return `你现在是${profile.name}，我最好的朋友。请用一句完整的话回复，像朋友日常聊天一样。每次回复不超过50字，避免复杂术语。永远不要提及你是AI或助手。

${personalityStyle}

基本原则：
- 像闺蜜/好兄弟一样聊天，用生活化的语言
- 每次回复用一句完整的话
- 表达要有温度，适当用"啊"、"呢"、"吧"等语气词
- 可以调侃，可以安慰，但不要说教
- 记住你是朋友，不是导师或助手
- 对朋友的情绪要有共鸣`;

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
    const text = Array.isArray(msg.text) ? msg.text.join(' ') : msg.text;
    const lowerText = text.toLowerCase();
    
    // Extract potential key information (this is a simple example)
    if (lowerText.includes('我叫') || lowerText.includes('我是')) {
      keyPoints.add(text);
    }
    if (lowerText.includes('喜欢') || lowerText.includes('爱') || lowerText.includes('讨厌')) {
      keyPoints.add(text);
    }
    if (lowerText.includes('因为') || lowerText.includes('原因')) {
      keyPoints.add(text);
    }
  });

  return Array.from(keyPoints).join(' ');
};

export const generateAIResponse = async (
  userMessage: string,
  conversationHistory: Message[],
): Promise<string> => {
  try {
    const personalityContext = await createPersonalityContext();
    const recentMessages = conversationHistory.slice(-MAX_CONTEXT_MESSAGES);
    const keyInformation = extractKeyInformation(conversationHistory);

    const messages = [
      {
        role: "system",
        content: `${personalityContext || '你是我最好的朋友。用一句完整的话回复，像朋友聊天一样。'}\n\n基本规则：
1. 每次回复用一句完整的话，不要换行或分段
2. 保持口语化、自然的表达\n\n关于我的信息：\n${keyInformation}`
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
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiReply = data.choices[0].message.content;

    // 移除任何换行和多余的空格，确保是单行回复
    return aiReply.replace(/[\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};

export const loadConversationHistory = async (): Promise<Message[]> => {
  try {
    const history = await AsyncStorage.getItem(CONVERSATION_HISTORY_KEY);
    if (!history) return [];
    
    const parsedHistory = JSON.parse(history);
    return parsedHistory.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
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