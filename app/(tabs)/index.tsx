import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import Collapsible from "react-native-collapsible"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function HomeScreen() {
  const [age, setAge] = useState<string>("")
  const [grade, setGrade] = useState<string | null>(null)
  const [englishLevel, setEnglishLevel] = useState<string | null>(null)
  const [studyGoal, setStudyGoal] = useState<string | null>(null)
  const [examType, setExamType] = useState<string | null>(null)
  const [accent, setAccent] = useState<string | null>(null)
  const [topics, setTopics] = useState<string[]>([])
  const [challenges, setChallenges] = useState<string[]>([])
  const [practiceFormat, setPracticeFormat] = useState<string | null>(null)

  // Modal visibility for grade selection
  const [gradeModalVisible, setGradeModalVisible] = useState(false)

  // Collapsible sections
  const [activeSection, setActiveSection] = useState<number | null>(null)

  // Grade options
  const gradeOptions = [
    "Primary School Grade 1",
    "Primary School Grade 2",
    "Primary School Grade 3",
    "Primary School Grade 4",
    "Primary School Grade 5",
    "Primary School Grade 6",
    "Junior High School Grade 1",
    "Junior High School Grade 2",
    "Junior High School Grade 3",
    "High School Grade 1",
    "High School Grade 2",
    "High School Grade 3",
  ]

  // Accent options
  const accentOptions = [
    { label: "American 🇺🇸", value: "American" },
    { label: "British 🇬🇧", value: "British" },
    { label: "Australian 🇦🇺", value: "Australian" },
    { label: "No Preference 🌎", value: "No preference" },
  ]
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.innerContainer}>
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.title}>Let's Get to Know You</Text>

          {/* Age Input */}
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setActiveSection(activeSection === 1 ? null : 1)}
          >
            <Text style={styles.sectionTitle}>How old are you?</Text>
            <Ionicons
              name={activeSection === 1 ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </Pressable>
          <Collapsible collapsed={activeSection !== 1}>
            <TextInput
              style={styles.ageInput}
              value={age}
              onChangeText={(text) => {
                if (/^\d{0,2}$/.test(text)) {
                  setAge(text)
                  if (parseInt(text) >= 18) setGrade(null)
                }
              }}
              keyboardType="numeric"
              placeholder="Enter your age"
              maxLength={2}
            />
          </Collapsible>

          {/* Grade Selection (If under 18) */}
          {age !== "" && parseInt(age) < 18 && (
            <>
              <Pressable
                style={styles.sectionHeader}
                onPress={() => setGradeModalVisible(true)}
              >
                <Text style={styles.sectionTitle}>Which grade are you in?</Text>
                <Ionicons name="chevron-down" size={24} />
              </Pressable>
              <Text style={styles.selectedValue}>
                {grade || "Select Grade"}
              </Text>

              {/* Native Grade Selection Modal */}
              <Modal
                visible={gradeModalVisible}
                transparent
                animationType="slide"
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <FlatList
                      data={gradeOptions}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.option}
                          onPress={() => {
                            setGrade(item)
                            setGradeModalVisible(false)
                          }}
                        >
                          <Text>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <Pressable
                      style={styles.closeButton}
                      onPress={() => setGradeModalVisible(false)}
                    >
                      <Text style={styles.closeText}>Close</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
            </>
          )}

          {/* English Level Selection */}
          {age !== "" && parseInt(age) >= 18 && (
            <>
              <Pressable
                style={styles.sectionHeader}
                onPress={() => setActiveSection(activeSection === 2 ? null : 2)}
              >
                <Text style={styles.sectionTitle}>Your English Level</Text>
                <Ionicons
                  name={activeSection === 2 ? "chevron-up" : "chevron-down"}
                  size={24}
                />
              </Pressable>
              <Collapsible collapsed={activeSection !== 2}>
                <View style={styles.optionContainer}>
                  {["Beginner", "Intermediate", "Advanced", "Fluent"].map(
                    (level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.option,
                          englishLevel === level ? styles.selectedOption : null, // Highlight selected
                        ]}
                        onPress={() => {
                          console.log("Selected:", level)
                          setEnglishLevel(level)
                        }}
                        activeOpacity={0.7} // Improves button responsiveness
                      >
                        <Text>{level}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </Collapsible>
            </>
          )}

          {/* Goal Selection */}
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setActiveSection(activeSection === 3 ? null : 3)}
          >
            <Text style={styles.sectionTitle}>What is your goal?</Text>
            <Ionicons
              name={activeSection === 3 ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </Pressable>
          <Collapsible collapsed={activeSection !== 3}>
            <View style={styles.optionContainer}>
              {[
                "Travel",
                "Work",
                "Studying",
                "Socializing",
                "Exams",
                "Other",
              ].map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.option,
                    goal === studyGoal ? styles.selectedOption : null, // Correct
                  ]}
                  onPress={() => setStudyGoal(goal)}
                >
                  <Text>{goal}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>
          {studyGoal === "Exams" && (
            <>
              <Pressable
                style={styles.sectionHeader}
                onPress={() => setActiveSection(activeSection === 4 ? null : 4)}
              >
                <Text style={styles.sectionTitle}>
                  Which exam are you preparing for?
                </Text>
                <Ionicons
                  name={activeSection === 4 ? "chevron-up" : "chevron-down"}
                  size={24}
                />
              </Pressable>
              <Collapsible collapsed={activeSection !== 4}>
                <View style={styles.optionContainer}>
                  {["IELTS", "TOEFL", "Other"].map((exam) => (
                    <TouchableOpacity
                      key={exam}
                      style={[
                        styles.option,
                        exam === examType ? styles.selectedOption : null,
                      ]}
                      onPress={() => setExamType(exam)}
                    >
                      <Text>{exam}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Collapsible>
            </>
          )}

          {/* Preferred Accent */}
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setActiveSection(activeSection === 5 ? null : 5)}
          >
            <Text style={styles.sectionTitle}>Preferred Accent</Text>
            <Ionicons
              name={activeSection === 5 ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </Pressable>
          <Collapsible collapsed={activeSection !== 5}>
            <View style={styles.optionContainer}>
              {[
                "American 🇺🇸",
                "British 🇬🇧",
                "Australian 🇦🇺",
                "No Preference 🌎",
              ].map((accentOption) => (
                <TouchableOpacity
                  key={accentOption}
                  style={[
                    styles.option,
                    accentOption === accent ? styles.selectedOption : null,
                  ]}
                  onPress={() => setAccent(accentOption)}
                >
                  <Text>{accentOption}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>
          {/* Topics of Interest */}
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setActiveSection(activeSection === 6 ? null : 6)}
          >
            <Text style={styles.sectionTitle}>Topics of Interest</Text>
            <Ionicons
              name={activeSection === 6 ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </Pressable>
          <Collapsible collapsed={activeSection !== 6}>
            <View style={styles.optionContainer}>
              {[
                "Conversations",
                "Work",
                "Travel",
                "News",
                "Science",
                "Entertainment",
              ].map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={[
                    styles.option,
                    topics.includes(topic) ? styles.selectedOption : null,
                  ]}
                  onPress={() => {
                    setTopics((prev) =>
                      prev.includes(topic)
                        ? prev.filter((t) => t !== topic)
                        : [...prev, topic]
                    )
                  }}
                >
                  <Text>{topic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>
          {/* Speaking Challenges */}
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setActiveSection(activeSection === 7 ? null : 7)}
          >
            <Text style={styles.sectionTitle}>
              Your biggest challenge in speaking
            </Text>
            <Ionicons
              name={activeSection === 7 ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </Pressable>
          <Collapsible collapsed={activeSection !== 7}>
            <View style={styles.optionContainer}>
              {[
                "Pronunciation",
                "Grammar",
                "Confidence",
                "Understanding natives",
              ].map((challenge) => (
                <TouchableOpacity
                  key={challenge}
                  style={[
                    styles.option,
                    challenges.includes(challenge)
                      ? styles.selectedOption
                      : null,
                  ]}
                  onPress={() => {
                    setChallenges((prev) =>
                      prev.includes(challenge)
                        ? prev.filter((c) => c !== challenge)
                        : [...prev, challenge]
                    )
                  }}
                >
                  <Text>{challenge}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>

          {/* Practice Format */}
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setActiveSection(activeSection === 8 ? null : 8)}
          >
            <Text style={styles.sectionTitle}>Preferred Practice Format</Text>
            <Ionicons
              name={activeSection === 8 ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </Pressable>
          <Collapsible collapsed={activeSection !== 8}>
            <View style={styles.optionContainer}>
              {[
                "Casual Chat",
                "Role-play",
                "Pronunciation Training",
                "Lessons",
              ].map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.option,
                    format === practiceFormat ? styles.selectedOption : null,
                  ]}
                  onPress={() => setPracticeFormat(format)}
                >
                  <Text>{format}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>
        </ScrollView>{" "}
      </View>
      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.submitButton}
          onPress={() => console.log("Start Practicing")}
        >
          <Text style={styles.submitText}>Start Practicing</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    justifyContent: "space-between", // Ensures scrolling & button placement
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Prevents content from being hidden under the button
  },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  optionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  option: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedOption: { backgroundColor: "#007AFF" },
  selectedValue: { fontSize: 16, color: "#007AFF", marginTop: 5 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#ff5555",
    padding: 10,
    borderRadius: 5,
  },
  closeText: { color: "white", fontSize: 16 },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white", // Ensures button has a background
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    color: "white",
    fontSize: 18,
  },
  ageInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: 100,
    textAlign: "center",
    marginVertical: 10,
  },
})
