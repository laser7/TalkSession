import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface AIProfile {
  name: string;
  gender: 'male' | 'female';
  personality?: string;
  horoscope?: string;
  createdAt: string;
}

const personalities = [
  "友好",
  "幽默",
  "温柔",
  "活泼",
  "智慧",
  "浪漫",
  "冒险",
  "艺术",
];

const horoscopes = [
  "白羊座",
  "金牛座",
  "双子座",
  "巨蟹座",
  "狮子座",
  "处女座",
  "天秤座",
  "天蝎座",
  "射手座",
  "摩羯座",
  "水瓶座",
  "双鱼座",
];

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [selectedHoroscope, setSelectedHoroscope] = useState('');

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert("提示", "请输入AI好友的名字");
      return;
    }
    if (!gender) {
      Alert.alert("提示", "请选择性别");
      return;
    }

    try {
      const profile = {
        name,
        gender,
        personality: selectedPersonality,
        horoscope: selectedHoroscope,
        createdAt: new Date().toISOString()
      };

      await AsyncStorage.setItem('@ai_profile', JSON.stringify(profile));
      router.replace('/');
    } catch (error) {
      console.error('Error saving AI profile:', error);
      Alert.alert("错误", "保存设置失败，请重试。");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>创建你的AI好友</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>名字</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="给你的AI好友起个名字"
            maxLength={20}
          />

          <Text style={styles.label}>性别</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderButtonSelected,
              ]}
              onPress={() => setGender('female')}
            >
              <Ionicons
                name="female"
                size={24}
                color={gender === 'female' ? 'white' : '#007AFF'}
              />
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'female' && styles.genderButtonTextSelected,
                ]}
              >
                女生
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderButtonSelected,
              ]}
              onPress={() => setGender('male')}
            >
              <Ionicons
                name="male"
                size={24}
                color={gender === 'male' ? 'white' : '#007AFF'}
              />
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'male' && styles.genderButtonTextSelected,
                ]}
              >
                男生
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>性格 (可选)</Text>
          <View style={styles.optionsContainer}>
            {personalities.map((personality) => (
              <TouchableOpacity
                key={personality}
                style={[
                  styles.optionButton,
                  selectedPersonality === personality && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedPersonality(personality)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedPersonality === personality &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  {personality}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>星座 (可选)</Text>
          <View style={styles.optionsContainer}>
            {horoscopes.map((horoscope) => (
              <TouchableOpacity
                key={horoscope}
                style={[
                  styles.optionButton,
                  selectedHoroscope === horoscope && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedHoroscope(horoscope)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedHoroscope === horoscope &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  {horoscope}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.completeButton, (!name || !gender) && styles.completeButtonDisabled]}
            onPress={handleComplete}
            disabled={!name || !gender}
          >
            <Text style={styles.completeButtonText}>完成</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 17,
    marginBottom: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    padding: 16,
    fontSize: 17,
    backgroundColor: 'white',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  genderButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  genderButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderButtonText: {
    color: '#666',
    fontSize: 17,
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: 'white',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: 'white',
  },
  completeButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 16,
    marginTop: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0,
  },
  completeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
}); 