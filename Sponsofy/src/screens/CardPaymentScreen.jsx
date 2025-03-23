"use client"

import { useState } from "react"
import { View, Text, Button, Alert, StyleSheet } from "react-native"
import { CreditCardInput } from "react-native-credit-card-input"
import api from "../config/axios" // Import the configured axios instance

const CardPaymentScreen = ({ route }) => {
  const { companyId, contentCreatorId } = route.params || {}
  const [cardData, setCardData] = useState(null)

  const handleCardInputChange = (formData) => {
    setCardData(formData)
  }

  const handleSubmit = async () => {
    if (!cardData || !cardData.valid) {
      Alert.alert("Error", "Please enter valid card details")
      return
    }

    const paymentData = {
      cardNumber: cardData.values.number.replace(/\s/g, ""),
      cardHolderName: "John Doe", // Replace with actual cardholder name
      expirationDate: cardData.values.expiry,
      cvv: cardData.values.cvc,
      amount: 100, // Replace with actual amount
      companyId,
      contentCreatorId,
    }

    try {
      // Use the configured api instance instead of axios directly
      const response = await api.post("/card-payments", paymentData)
      Alert.alert("Success", "Payment processed successfully")
      console.log(response.data)
    } catch (error) {
      console.error("Error processing payment:", error)
      Alert.alert("Error", "Failed to process payment")
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Card Details</Text>
      <CreditCardInput onChange={handleCardInputChange} />
      <Button title="Submit Payment" onPress={handleSubmit} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    color: "white",
  },
})

export default CardPaymentScreen

