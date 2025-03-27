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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Message, generateAIResponse, loadConversationHistory, saveConversationHistory } from "./services/ai"

interface AIProfile {
  name: string
  gender: 'male' | 'female'
  personality?: string
  horoscope?: string
  createdAt: string
}

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
        Alert.alert('Sorry, we need camera roll permissions to make this work!')
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
            text: `Hi! I'm ${profile.name}, and I'm excited to be your friend! How are you doing today?`,
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
          text: "Shared an image",
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
          Alert.alert("Error", "Failed to get AI response. Please try again.")
        } finally {
          setIsLoading(false)
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image. Please try again.")
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
      // Add personality context to the message
      const personalityContext = `You are ${aiProfile.name}, a ${aiProfile.gender} AI friend with a ${aiProfile.personality || 'friendly'} personality${aiProfile.horoscope ? ` and ${aiProfile.horoscope} horoscope` : ''}. Respond in a way that reflects these traits while maintaining a natural conversation.`
      
      const aiResponse = await generateAIResponse(inputText, messages, personalityContext)
      
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
      Alert.alert("Error", "Failed to get AI response. Please try again.")
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
        <Text style={styles.headerTitle}>{aiProfile.name}</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            Alert.alert(
              "Modify AI Friend",
              "Are you sure you want to modify your AI friend's settings? This will restart your conversation.",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Modify",
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
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={`Message ${aiProfile.name}...`}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() ? "#007AFF" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  settingsButton: {
    padding: 5,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "white",
  },
  aiMessageText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  aiTimestamp: {
    color: "#666",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  attachButton: {
    padding: 5,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}) 