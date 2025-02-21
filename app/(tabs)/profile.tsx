// /app/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';

const ProfileScreen = () => {
  // Example user data (this could come from props or a state)
  const user = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg', // Example profile picture URL
  };

  const handleEditProfile = () => {
    // Functionality for editing profile (can be implemented as needed)
    alert('Edit profile functionality goes here!');
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.profilePicture }} style={styles.profilePicture} />
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.userEmail}>{user.email}</Text>

      <Button title="Edit Profile" onPress={handleEditProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
});

export default ProfileScreen;