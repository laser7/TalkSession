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

const personalities = [
  { label: 'Select a personality', value: '' },
  { label: 'Cheerful & Optimistic', value: 'cheerful' },
  { label: 'Calm & Supportive', value: 'calm' },
  { label: 'Witty & Humorous', value: 'witty' },
  { label: 'Intellectual & Curious', value: 'intellectual' },
];

const horoscopes = [
  { label: 'Select a horoscope (optional)', value: '' },
  { label: 'Aries', value: 'Aries' },
  { label: 'Taurus', value: 'Taurus' },
  { label: 'Gemini', value: 'Gemini' },
  { label: 'Cancer', value: 'Cancer' },
  { label: 'Leo', value: 'Leo' },
  { label: 'Virgo', value: 'Virgo' },
  { label: 'Libra', value: 'Libra' },
  { label: 'Scorpio', value: 'Scorpio' },
  { label: 'Sagittarius', value: 'Sagittarius' },
  { label: 'Capricorn', value: 'Capricorn' },
  { label: 'Aquarius', value: 'Aquarius' },
  { label: 'Pisces', value: 'Pisces' },
];

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [personality, setPersonality] = useState('');
  const [horoscope, setHoroscope] = useState('');

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for your AI friend');
      return;
    }
    if (!gender) {
      Alert.alert('Error', 'Please select a gender for your AI friend');
      return;
    }

    try {
      const aiProfile = {
        name: name.trim(),
        gender,
        personality: personality || 'friendly',
        horoscope: horoscope || undefined,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('@ai_profile', JSON.stringify(aiProfile));
      await AsyncStorage.removeItem('@conversation_history');
      router.replace('/');
    } catch (error) {
      console.error('Error saving AI profile:', error);
      Alert.alert('Error', 'Failed to save AI profile. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Your AI Friend</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter a name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender (Required)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(value: string) => setGender(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Personality</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={personality}
              onValueChange={(value: string) => setPersonality(value)}
              style={styles.picker}
            >
              {personalities.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Horoscope (Optional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={horoscope}
              onValueChange={(value: string) => setHoroscope(value)}
              style={styles.picker}
            >
              {horoscopes.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!name.trim() || !gender) && styles.buttonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!name.trim() || !gender}
        >
          <Text style={styles.buttonText}>Create My AI Friend</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 60,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
}); 