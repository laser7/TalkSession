import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Dimensions,
} from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

const { height } = Dimensions.get("window") // Get screen height

const SessionScreen = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const scaleAnim = new Animated.Value(1)
  const pulseAnim = new Animated.Value(1)

  // Subtle pulse effect when `isSpeaking` is false
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  return (
    <View style={styles.container}>
      {/* Top Section: Title & Info */}
      {!isSpeaking && (
        <View style={styles.header}>
          <Text style={styles.title}>AI Speaking Session</Text>
          <Text style={styles.subtitle}>
            Improve your speaking skills with real-time feedback.
          </Text>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#888"
            style={styles.infoIcon}
          />
        </View>
      )}

      {/* Transcription Section */}
      <View style={styles.transcriptionContainer}>
        {isSpeaking ? (
          <Text style={styles.transcribedText}>Listening...</Text>
        ) : null}
      </View>

      {/* Bottom Section: Microphone & UI */}
      <View style={styles.bottomContainer}>
        {/* Voice Waveform Animation (Visible Only When Speaking) */}
        {isSpeaking && (
          <Animated.View style={styles.waveform}>
            {Array.from({ length: 12 }).map((_, index) => (
              <Animated.View
                key={index}
                style={[styles.waveBar, { height: Math.random() * 30 + 10 }]}
              />
            ))}
          </Animated.View>
        )}

        {/* Microphone Button */}
        <Pressable
          style={styles.micButton}
          onPress={() => setIsSpeaking(!isSpeaking)}
        >
          <Animated.View
            style={[
              styles.micCircle,
              { transform: [{ scale: isSpeaking ? scaleAnim : pulseAnim }] },
            ]}
          >
            <Ionicons name="mic-outline" size={40} color="white" />
          </Animated.View>
        </Pressable>

        {/* Tap to Start Text (Only When Not Speaking) */}
        {!isSpeaking && <Text style={styles.tapText}>Tap to Start</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB", // Light professional background
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 5,
  },
  infoIcon: {
    marginTop: 10,
  },
  transcriptionContainer: {
    height: height * 0.3, // Takes up the top portion
    justifyContent: "center",
    alignItems: "center",
  },
  transcribedText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  bottomContainer: {
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 50, // Moves UI to the bottom
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    height: 40,
    marginBottom: 30,
  },
  waveBar: {
    width: 6,
    backgroundColor: "#7B61FF", // Wave color
    borderRadius: 3,
    marginHorizontal: 3,
  },
  micButton: {
    alignItems: "center",
  },
  micCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#7B61FF", // Purple mic button
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#7B61FF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  tapText: {
    marginTop: 10,
    fontSize: 16,
    color: "#888",
  },
})

export default SessionScreen
