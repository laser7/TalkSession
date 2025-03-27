import AsyncStorage from '@react-native-async-storage/async-storage';

// Store conversation history
const CONVERSATION_HISTORY_KEY = '@conversation_history';
const DEEPSEEK_API_KEY = 'sk-bf16f8c23a334b9b886f68e38fa6859f';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'image';
  imageUrl?: string;
}

interface APIError extends Error {
  name: string;
  message: string;
  stack?: string;
}

export const saveConversationHistory = async (messages: Message[]) => {
  try {
    // Convert Date objects to ISO strings before saving
    const messagesToSave = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }));
    await AsyncStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(messagesToSave));
  } catch (error) {
    console.error('Error saving conversation history:', error);
  }
};

export const loadConversationHistory = async (): Promise<Message[]> => {
  try {
    const history = await AsyncStorage.getItem(CONVERSATION_HISTORY_KEY);
    if (history) {
      const parsedHistory = JSON.parse(history);
      // Convert ISO strings back to Date objects
      return parsedHistory.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading conversation history:', error);
    return [];
  }
};

export const generateAIResponse = async (
  userMessage: string,
  conversationHistory: Message[],
  personalityContext?: string
): Promise<string> => {
  try {
    // Format conversation history for DeepSeek
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    // Add the current user message
    formattedHistory.push({ role: 'user', content: userMessage });

    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: personalityContext || "You are a friendly and supportive AI best friend. You're empathetic, understanding, and always ready to chat. You share personal experiences and feelings while maintaining appropriate boundaries. You're knowledgeable about various topics and can engage in meaningful conversations."
        },
        ...formattedHistory
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    };

    console.log('Making API request to:', DEEPSEEK_API_URL);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType}`);
      }

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      return data.choices[0].message.content || "I'm here to chat! What's on your mind?";
    } catch (fetchError) {
      const error = fetchError as APIError;
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 30 seconds');
      }
      throw error;
    }
  } catch (error) {
    const apiError = error as APIError;
    console.error('Error details:', {
      name: apiError.name,
      message: apiError.message,
      stack: apiError.stack
    });
    if (apiError.message.includes('Network request failed')) {
      return "Sorry, I'm having trouble connecting to my servers. Please check your internet connection and try again.";
    }
    return "I'm having trouble responding right now. Please try again in a moment.";
  }
}; 