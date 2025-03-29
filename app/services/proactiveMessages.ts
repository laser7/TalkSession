import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateAIResponse, Message, saveConversationHistory, loadConversationHistory } from './ai';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const LAST_PROACTIVE_MESSAGE_TIME = '@last_proactive_message_time';
const MIN_INTERVAL_HOURS = 4; // Minimum hours between proactive messages
const MAX_INTERVAL_HOURS = 12; // Maximum hours between proactive messages

const getProactivePrompt = (keyInfo: string): string => {
  const prompts = [
    "Based on our previous conversations, I was thinking about you and wanted to check in. How are you doing?",
    "Hey! Something reminded me of our chat about {topic}. What's new with you?",
    "I remembered you mentioned {topic} before. How's that going?",
    "Just wanted to say hi and see how you're doing! Any updates on {topic}?",
    "Been thinking about what you said about {topic}. How are things?"
  ];

  let prompt = prompts[Math.floor(Math.random() * prompts.length)];
  
  // Extract a relevant topic from key information if available
  const topics = keyInfo.match(/(?:like|love|enjoy|into|about)\s(\w+)/gi);
  if (topics && topics.length > 0) {
    const topic = topics[Math.floor(Math.random() * topics.length)]
      .replace(/(?:like|love|enjoy|into|about)\s/gi, '');
    prompt = prompt.replace('{topic}', topic);
  } else {
    // If no specific topic found, use a general prompt
    prompt = prompts[0];
  }

  return prompt;
};

export const initializeProactiveMessages = async () => {
  // Request notification permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return;
  }

  // Set up notification handler
  Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
};

const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
  // When user taps notification, open the chat screen
  // You'll need to implement the navigation logic here
  console.log('Notification tapped:', response);
};

export const scheduleNextProactiveMessage = async () => {
  try {
    const lastMessageTime = await AsyncStorage.getItem(LAST_PROACTIVE_MESSAGE_TIME);
    const now = new Date();

    if (lastMessageTime) {
      const lastTime = new Date(lastMessageTime);
      const hoursSinceLastMessage = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastMessage < MIN_INTERVAL_HOURS) {
        return; // Too soon for another message
      }
    }

    // Random delay between MIN and MAX interval
    const delayHours = Math.random() * (MAX_INTERVAL_HOURS - MIN_INTERVAL_HOURS) + MIN_INTERVAL_HOURS;
    const triggerDate = new Date(now.getTime() + delayHours * 60 * 60 * 1000);

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "New message from your AI friend",
        body: "Tap to view the message",
      },
      trigger: {
        seconds: delayHours * 60 * 60,
      } as unknown as Notifications.NotificationTriggerInput,
    });

    // Save the scheduled time
    await AsyncStorage.setItem(LAST_PROACTIVE_MESSAGE_TIME, triggerDate.toISOString());
  } catch (error) {
    console.error('Error scheduling proactive message:', error);
  }
};

export const sendProactiveMessage = async () => {
  try {
    // Load conversation history and AI profile
    const history = await loadConversationHistory();
    const profileJson = await AsyncStorage.getItem('@ai_profile');
    
    if (!profileJson || history.length === 0) return;
    
    const profile = JSON.parse(profileJson);
    const keyInfo = history
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.text)
      .join(' ');

    // Generate the proactive message
    const prompt = getProactivePrompt(keyInfo);
    const aiResponse = await generateAIResponse(
      `You are ${profile.name}, a ${profile.gender} AI friend with a ${profile.personality || 'friendly'} personality. 
      You're initiating a casual conversation with your friend. Keep it natural and reference previous conversations.
      ${prompt}`,
      history
    );

    // Create and save the new message
    const newMessage: Message = {
      id: Date.now().toString(),
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
    };

    const updatedHistory = [...history, newMessage];
    await saveConversationHistory(updatedHistory);

    // Schedule the next proactive message
    await scheduleNextProactiveMessage();

    return newMessage;
  } catch (error) {
    console.error('Error sending proactive message:', error);
  }
}; 