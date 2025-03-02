import React, { useState } from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import Ionicons from "@expo/vector-icons/Ionicons"
interface SessionSelectionProps {
  setSessionStatus: (status: string) => void
}

const SessionSelection: React.FC<SessionSelectionProps> = ({
  setSessionStatus,
}) => {
  return (
    <View style={styles.blockContainer}>
      <Pressable
        style={[styles.block, { backgroundColor: "#cfec87", gap: 8 }]}
        onPointerDown={() => {
          setSessionStatus("talk")
        }}
      >
        <MaterialIcons name="keyboard-voice" size={44} color="black" />
        <Text style={{ fontSize: 20, fontWeight: 700 }}>Talk</Text>
      </Pressable>
      <Pressable
        style={[styles.block, { backgroundColor: "#ece687", gap: 8 }]}
        onPointerDown={() => {
          setSessionStatus("chat")
        }}
      >
        <Ionicons name="chatbox-ellipses-outline" size={44} color="black" />
        <Text style={{ fontSize: 20, fontWeight: 700 }}>Chat</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  blockContainer: {
    flex: 1, // Full height container
    width: "100%", // Full width
    paddingHorizontal: 22,
    paddingVertical: 44,
    gap: 24,
  },
  block: {
    flex: 1, // Each block takes half the screen height
    width: "100%", // Full width
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
})
export default SessionSelection
