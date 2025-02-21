// /app/talkSession.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: string; // "user" or "agent"
}

const SessionScreen = () => {
  // State to hold the list of messages
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'agent' },
  ]);
  
  // State to hold the input message
  const [inputMessage, setInputMessage] = useState<string>('');

  // Function to handle sending the message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: (messages.length + 1).toString(),
        text: inputMessage,
        sender: 'user', // Assume the sender is the user
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage(''); // Clear the input field
      handleAgentResponse(); // Get agent's response
    }
  };

  // Simulate agent's response
  const handleAgentResponse = () => {
    const agentMessage: Message = {
      id: (messages.length + 2).toString(),
      text: 'I\'m here to assist you!',
      sender: 'agent',
    };
    setMessages((prevMessages) => [...prevMessages, agentMessage]);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={item.sender === 'user' ? styles.userMessage : styles.agentMessage}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted // Makes the latest message appear at the bottom
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message"
            value={inputMessage}
            onChangeText={setInputMessage}
          />
          <Button title="Send" onPress={handleSendMessage} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f1f1f1',
  },
  userMessage: {
    backgroundColor: '#d1f7c4',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-end',
    maxWidth: '75%',
  },
  agentMessage: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '75%',
  },
  messageText: {
    fontSize: 16,
  },
});

export default SessionScreen;