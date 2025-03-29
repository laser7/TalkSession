import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Message, generateAIResponse, loadConversationHistory, saveConversationHistory } from "./services/ai"
import * as Notifications from 'expo-notifications'
import { scheduleNextProactiveMessage } from './services/proactiveMessages'

interface AIProfile {
  name: string
  gender: 'male' | 'female'
  personality?: string
  horoscope?: string
  createdAt: string
}

const TypingIndicator = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    const animateDots = () => {
      const duration = 500;
      const delay = 200;

      Animated.sequence([
        // Reset all dots
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        // Animate dot 1
        Animated.timing(dot1, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        // Animate dot 2
        Animated.timing(dot2, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        // Animate dot 3
        Animated.timing(dot3, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Restart animation
        animateDots();
      });
    };

    animateDots();
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Text style={styles.typingText}>正在输入</Text>
      <View style={styles.dotsContainer}>
        <Animated.Text 
          style={[
            styles.dot,
            {
              opacity: dot1,
              transform: [{
                translateY: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -4]
                })
              }]
            }
          ]}
        >
          .
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.dot,
            {
              opacity: dot2,
              transform: [{
                translateY: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -4]
                })
              }]
            }
          ]}
        >
          .
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.dot,
            {
              opacity: dot3,
              transform: [{
                translateY: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -4]
                })
              }]
            }
          ]}
        >
          .
        </Animated.Text>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [aiProfile, setAiProfile] = useState<AIProfile | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // Request permissions when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('抱歉', '我们需要相册权限才能使用这个功能！')
      }
    })()
  }, [])

  // Check for AI profile and load conversation history
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const profileJson = await AsyncStorage.getItem('@ai_profile')
        if (!profileJson) {
          // No profile found, redirect to onboarding
          setIsInitializing(false)
          router.replace('/onboarding')
          return
        }

        const profile = JSON.parse(profileJson) as AIProfile
        setAiProfile(profile)

        // Load conversation history
        const history = await loadConversationHistory()
        if (history.length === 0) {
          // Add welcome message
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            text: `你好！我是 ${profile.name}，很高兴成为你的朋友！今天过得怎么样？`,
            sender: "ai",
            timestamp: new Date(),
            type: "text",
          }
          setMessages([welcomeMessage])
          await saveConversationHistory([welcomeMessage])
        } else {
          setMessages(history)
        }
        setIsInitializing(false)
      } catch (error) {
        console.error('Error initializing chat:', error)
        setIsInitializing(false)
        router.replace('/onboarding')
      }
    }

    initializeChat()
  }, [])

  // Set up notification handling
  useEffect(() => {
    // Handle notifications when app is in foreground
    const subscription = Notifications.addNotificationReceivedListener(async notification => {
      // Refresh messages when a new proactive message arrives
      const history = await loadConversationHistory();
      setMessages(history);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Scroll to bottom when messages change or when entering chat
  useEffect(() => {
    if (messages.length > 0 && !isInitializing) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100); // Small delay to ensure render is complete
    }
  }, [messages, isInitializing]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: "分享了一张图片",
          sender: "user",
          timestamp: new Date(),
          type: "image",
          imageUrl: result.assets[0].uri,
        }

        setMessages((prev) => [...prev, newMessage])
        setIsLoading(true)

        try {
          // Here you would typically upload the image to a server
          // For now, we'll just simulate an AI response
          const aiResponse = await generateAIResponse("I see you shared an image!", messages)
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            sender: "ai",
            timestamp: new Date(),
            type: "text",
          }

          const updatedMessages = [...messages, newMessage, aiMessage]
          setMessages(updatedMessages)
          await saveConversationHistory(updatedMessages)
        } catch (error) {
          console.error("Error getting AI response:", error)
          Alert.alert("错误", "获取AI回复失败，请重试。")
        } finally {
          setIsLoading(false)
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("错误", "选择图片失败，请重试。")
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || !aiProfile) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, newMessage])
    setInputText("")
    setIsLoading(true)

    try {
      const aiResponse = await generateAIResponse(inputText, messages)
      
      // 处理AI回复，可能是字符串或字符串数组
      const aiMessages: Message[] = Array.isArray(aiResponse) 
        ? aiResponse.map((text, index) => ({
            id: (Date.now() + index + 1).toString(),
            text,
            sender: "ai",
            timestamp: new Date(Date.now() + index * 500), // 添加小延迟使消息时间不同
            type: "text",
          }))
        : [{
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            sender: "ai",
            timestamp: new Date(),
            type: "text",
          }];

      const updatedMessages = [...messages, newMessage, ...aiMessages]
      setMessages(updatedMessages)
      await saveConversationHistory(updatedMessages)

      // Schedule next proactive message after user interaction
      await scheduleNextProactiveMessage()
    } catch (error) {
      console.error("Error getting AI response:", error)
      Alert.alert("错误", "获取AI回复失败，请重试。")
    } finally {
      setIsLoading(false)
      flatListRef.current?.scrollToEnd({ animated: true })
    }
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {item.type === "image" && item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.messageImage}
          resizeMode="cover"
        />
      )}
      <Text style={[
        styles.messageText,
        item.sender === "user" ? styles.userMessageText : styles.aiMessageText
      ]}>
        {item.text}
      </Text>
      <Text style={[
        styles.timestamp,
        item.sender === "user" ? styles.userTimestamp : styles.aiTimestamp
      ]}>
        {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  )

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  if (!aiProfile) {
    return null
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/')}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{aiProfile.name}</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            Alert.alert(
              "修改AI好友",
              "确定要修改AI好友的设置吗？这将重新开始对话。",
              [
                {
                  text: "取消",
                  style: "cancel"
                },
                {
                  text: "修改",
                  onPress: () => router.push('/onboarding')
                }
              ]
            );
          }}
        >
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10
        }}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={`给${aiProfile.name}发消息...`}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() && !isLoading ? "#007AFF" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#F0F1F6',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    color: "#1A1A1A",
  },
  settingsButton: {
    padding: 8,
    backgroundColor: '#F0F1F6',
    borderRadius: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    padding: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "white",
  },
  aiMessageText: {
    color: "#1A1A1A",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  aiTimestamp: {
    color: "#666",
  },
  messageImage: {
    width: 240,
    height: 240,
    borderRadius: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  attachButton: {
    padding: 8,
    backgroundColor: '#F0F1F6',
    borderRadius: 12,
  },
  input: {
    flex: 1,
    marginHorizontal: 12,
    padding: 12,
    paddingVertical: 10,
    backgroundColor: "#F0F1F6",
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 120,
    color: "#1A1A1A",
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#F0F1F6',
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F8F9FD',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  typingText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 2,
  },
  dot: {
    color: '#666',
    fontSize: 14,
    lineHeight: 14,
    fontWeight: 'bold',
  },
}) 