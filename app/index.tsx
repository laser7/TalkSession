import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadConversationHistory } from './services/ai';

interface AIProfile {
  name: string;
  gender: 'male' | 'female';
  personality?: string;
  horoscope?: string;
  createdAt: string;
}

export default function HomePage() {
  const [aiProfile, setAiProfile] = useState<AIProfile | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastMessagePreview, setLastMessagePreview] = useState<string>('');

  useEffect(() => {
    loadProfile();
    checkNewMessages();
  }, []);

  const loadProfile = async () => {
    try {
      const profileJson = await AsyncStorage.getItem('@ai_profile');
      console.log('Profile JSON:', profileJson); // Debug log
      if (profileJson) {
        const parsed = JSON.parse(profileJson);
        console.log('Parsed profile:', parsed); // Debug log
        setAiProfile(parsed);
      } else {
        console.log('No profile found, redirecting to onboarding'); // Debug log
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const checkNewMessages = async () => {
    try {
      const history = await loadConversationHistory();
      if (history.length > 0) {
        const lastMessage = history[history.length - 1];
        if (lastMessage.sender === 'ai') {
          setHasNewMessage(true);
          setLastMessagePreview(Array.isArray(lastMessage.text) ? lastMessage.text.join(' ') : lastMessage.text);
        }
      }
    } catch (error) {
      console.error('Error checking messages:', error);
    }
  };

  const startChat = () => {
    console.log('Starting chat with profile:', aiProfile); // Debug log
    if (aiProfile) {
      setHasNewMessage(false);
      try {
        router.replace('/chat')
        console.log('Navigation attempted to chat'); // Debug log
      } catch (error) {
        console.error('Navigation error:', error); // Log navigation errors
      }
    } else {
      console.log('No profile available for chat'); // Debug log
    }
  };

  if (!aiProfile) {
    return null; // Don't render anything while checking profile
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>我的AI好友</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => Alert.alert('即将推出!', '用户设置功能将在下次更新中提供。')}
        >
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons 
            name={aiProfile.gender === 'female' ? 'person-circle' : 'person-circle-outline'} 
            size={80} 
            color="#007AFF" 
          />
          {hasNewMessage && (
            <View style={styles.notificationBadge} />
          )}
        </View>
        <Text style={styles.name}>{aiProfile.name}</Text>
        <Text style={styles.personality}>
          {aiProfile.personality || '友好'} 性格
        </Text>
        
        {hasNewMessage && (
          <View style={styles.messagePreview}>
            <Text style={styles.messagePreviewText} numberOfLines={2}>
              {lastMessagePreview}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.chatButton, hasNewMessage && styles.chatButtonWithNotification]} 
          onPress={startChat}
        >
          <Ionicons 
            name={hasNewMessage ? "chatbox" : "chatbubble-outline"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.chatButtonText}>
            {hasNewMessage ? '查看消息' : '继续聊天'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>功能特点</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles-outline" size={24} color="#007AFF" />
            <Text style={styles.featureTitle}>自然对话</Text>
            <Text style={styles.featureDesc}>与你的AI好友进行自然的对话</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="notifications-outline" size={24} color="#007AFF" />
            <Text style={styles.featureTitle}>主动互动</Text>
            <Text style={styles.featureDesc}>你的好友会主动联系你聊天</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  settingsButton: {
    padding: 8,
    backgroundColor: '#F0F1F6',
    borderRadius: 12,
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
    backgroundColor: '#F0F1F6',
    padding: 20,
    borderRadius: 40,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  personality: {
    fontSize: 17,
    color: '#666',
    marginBottom: 20,
    backgroundColor: '#F0F1F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  messagePreview: {
    backgroundColor: '#F8F9FD',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  messagePreviewText: {
    color: '#4A4A4A',
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  chatButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chatButtonWithNotification: {
    backgroundColor: '#FF3B30',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
  },
  featuresContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1A1A1A',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    backgroundColor: 'white',
    width: '48%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#1A1A1A',
  },
  featureDesc: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
}); 