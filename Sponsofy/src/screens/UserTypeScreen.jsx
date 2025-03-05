"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

const UserTypeScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState(null)

  const handleContinue = () => {
    if (selectedType) {
      // Pass the user type to the signup screen
      navigation.navigate("Signup", { userType: selectedType })
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Are you an Influencer or a Company?</Text>

        <TouchableOpacity
          style={[styles.optionButton, selectedType === "influencer" && styles.selectedOption]}
          onPress={() => setSelectedType("influencer")}
        >
          <Text style={styles.optionText}>Influencer</Text>
          <Text style={styles.optionCount}>32k</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, selectedType === "company" && styles.selectedOption]}
          onPress={() => setSelectedType("company")}
        >
          <Text style={styles.optionText}>Company</Text>
          <Text style={styles.optionCount}>21k</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !selectedType && styles.disabledButton]}
        onPress={handleContinue}
        disabled={!selectedType}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
  },
  optionButton: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#8B5CF6",
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  optionCount: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.7,
  },
  continueButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#333333",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default UserTypeScreen