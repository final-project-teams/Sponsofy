"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Feather, FontAwesome } from "@expo/vector-icons"
import api from "../config/axios"

const PostCardScreen = ({ route, navigation }) => {
  const { userId } = route.params || {}

  const [cardNumber, setCardNumber] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [loading, setLoading] = useState(false)

  // Format card number with spaces
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned
    return formatted.slice(0, 19) // Limit to 16 digits + 3 spaces
  }

  // Format expiration date as MM/YY
  const formatExpirationDate = (text) => {
    const cleaned = text.replace(/[^0-9]/gi, "")
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
    }
    return cleaned
  }

  const validateForm = () => {
    if (!cardNumber || cardNumber.replace(/\s+/g, "").length < 16) {
      Alert.alert("Error", "Please enter a valid card number")
      return false
    }

    if (!cardHolderName) {
      Alert.alert("Error", "Please enter the card holder name")
      return false
    }

    if (!expirationDate || expirationDate.length < 5) {
      Alert.alert("Error", "Please enter a valid expiration date (MM/YY)")
      return false
    }

    if (!cvv || cvv.length < 3) {
      Alert.alert("Error", "Please enter a valid CVV code")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      // Determine if user is a content creator or company
      // Try content creator endpoint first
      try {
        const response = await api.post(`/card-payments/content-creator/${userId}`, {
          cardNumber: cardNumber.replace(/\s+/g, ""),
          cardHolderName,
          expirationDate,
          cvv,
        })

        Alert.alert("Success", "Card payment added successfully", [{ text: "OK", onPress: () => navigation.goBack() }])
      } catch (error) {
        // If content creator endpoint fails, try company endpoint
        if (error.response && error.response.status === 404) {
          const response = await api.post(`/card-payments/company/${userId}`, {
            cardNumber: cardNumber.replace(/\s+/g, ""),
            cardHolderName,
            expirationDate,
            cvv,
          })

          Alert.alert("Success", "Card payment added successfully", [
            { text: "OK", onPress: () => navigation.goBack() },
          ])
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error("Error adding card payment:", error)
      Alert.alert("Error", "Failed to add card payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardPreview}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardType}>CREDIT CARD</Text>
            <FontAwesome name="cc-visa" size={30} color="#fff" />
          </View>

          <Text style={styles.cardNumberPreview}>{cardNumber || "•••• •••• •••• ••••"}</Text>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>CARD HOLDER</Text>
              <Text style={styles.cardValue}>{cardHolderName || "YOUR NAME"}</Text>
            </View>

            <View>
              <Text style={styles.cardLabel}>EXPIRES</Text>
              <Text style={styles.cardValue}>{expirationDate || "MM/YY"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#666"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="numeric"
                maxLength={19}
              />
              <FontAwesome name="credit-card" size={20} color="#8A2BE2" style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Holder Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#666"
                value={cardHolderName}
                onChangeText={setCardHolderName}
              />
              <Feather name="user" size={20} color="#8A2BE2" style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Expiration Date</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#666"
                  value={expirationDate}
                  onChangeText={(text) => setExpirationDate(formatExpirationDate(text))}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <Feather name="calendar" size={20} color="#8A2BE2" style={styles.inputIcon} />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#666"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                <Feather name="lock" size={20} color="#8A2BE2" style={styles.inputIcon} />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Add Card</Text>
                <Feather name="arrow-right" size={20} color="white" style={styles.submitIcon} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    padding: 20,
  },
  cardPreview: {
    height: 200,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#8A2BE2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  cardType: {
    color: "#8A2BE2",
    fontSize: 14,
    fontWeight: "bold",
  },
  cardNumberPreview: {
    color: "white",
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 30,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: "#888",
    fontSize: 10,
    marginBottom: 5,
  },
  cardValue: {
    color: "white",
    fontSize: 14,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: "white",
    paddingVertical: 12,
    fontSize: 16,
  },
  inputIcon: {
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
  },
  submitButton: {
    backgroundColor: "#8A2BE2",
    borderRadius: 8,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitIcon: {
    marginLeft: 10,
  },
})

export default PostCardScreen

