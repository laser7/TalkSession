import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { playVoiceMessage } from '../services/audio';

interface VoiceMessageProps {
  audioUrl: string;
  duration: number;
  isUser?: boolean;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({ audioUrl, duration, isUser = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    try {
      setIsPlaying(true);
      await playVoiceMessage(audioUrl);
      setIsPlaying(false);
    } catch (error) {
      console.error('播放失败:', error);
      setIsPlaying(false);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePlay}
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer
      ]}
    >
      <Ionicons 
        name={isPlaying ? "pause" : "play"} 
        size={24} 
        color={isUser ? "#fff" : "#000"} 
      />
      <View style={styles.infoContainer}>
        <View style={styles.waveform}>
          {/* 简单的波形图效果 */}
          {Array.from({ length: 10 }).map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.bar,
                { 
                  height: Math.random() * 15 + 5,
                  backgroundColor: isUser ? "#fff" : "#000" 
                }
              ]} 
            />
          ))}
        </View>
        <Text style={[
          styles.duration,
          { color: isUser ? "#fff" : "#666" }
        ]}>
          {duration}秒
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    maxWidth: '70%',
    marginVertical: 4,
  },
  userContainer: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  aiContainer: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'flex-start',
    marginRight: 'auto',
  },
  infoContainer: {
    marginLeft: 10,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginBottom: 4,
  },
  bar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  duration: {
    fontSize: 12,
  },
}); 