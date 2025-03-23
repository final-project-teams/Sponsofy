"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { Feather } from "@expo/vector-icons"
import api from "../config/axios"


const DeleteCardScreen = ({ route, navigation }) => {
    const { id, userId } = route.params || {}
    const [cardDetails, setCardDetails] = useState(null)
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
  
    useEffect(() => {
      if (id) {
        fetchCardDetails()
      } else {
        setFetchLoading(false)
        Alert.alert("Select Card", "Please select a card to delete from your cards list", [
          { text: "OK", onPress: () => navigation.navigate("GetAllCards", { userId }) },
        ])
      }
    }, [id])
  
    const fetchCardDetails = async () => {
      try {
        setFetchLoading(true)
        const response = await api.get(`/card-payments/${id}`)
  
        if (response.data && response.data.cardPayment) {
          setCardDetails(response.data.cardPayment)
        }
      } catch (error) {
        console.error("Error fetching card details:", error)
        Alert.alert("Error", "Failed to load card details")
        navigation.goBack()
      } finally {
        setFetchLoading(false)
      }
    }
  
    const handleDelete = async () => {
      Alert.alert("Confirm Deletion", "Are you sure you want to delete this card? This action cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDelete },
      ])
    }
  
    const confirmDelete = async () => {
      try {
        setLoading(true)
        await api.delete(`/card-payments/${id}`)
  
        Alert.alert("Success", "Card payment deleted successfully", [
          { text: "OK", onPress: () => navigation.navigate("GetAllCards", { userId }) },
        ])
      } catch (error) {
        console.error("Error deleting card payment:", error)
        Alert.alert("Error", "Failed to delete card payment. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  
    if (fetchLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={styles.loadingText}>Loading card details...</Text>
        </View>
      )
    }
  
    if (!cardDetails) {
      return (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={50} color="#ff3b30" />
          <Text style={styles.errorText}>Card details not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )
    }
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Delete Card</Text>
        </View>
  
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardType}>CREDIT CARD</Text>
              <Feather name="credit-card" size={24} color="#8A2BE2" />
            </View>
  
            <Text style={styles.cardNumber}>•••• •••• •••• {cardDetails.cardNumber.slice(-4)}</Text>
  
            <View style={styles.cardDetails}>
              <View>
                <Text style={styles.detailLabel}>Card Holder</Text>
                <Text style={styles.detailValue}>{cardDetails.cardHolderName}</Text>
              </View>
  
              <View>
                <Text style={styles.detailLabel}>Expires</Text>
                <Text style={styles.detailValue}>{cardDetails.expirationDate}</Text>
              </View>
            </View>
  
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amountValue}>${Number.parseFloat(cardDetails.amount).toFixed(2)}</Text>
            </View>
          </View>
        </View>
  
        <View style={styles.warningContainer}>
          <Feather name="alert-triangle" size={24} color="#ff3b30" />
          <Text style={styles.warningText}>You are about to delete this card payment. This action cannot be undone.</Text>
        </View>
  
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Feather name="trash-2" size={20} color="white" style={styles.deleteIcon} />
                <Text style={styles.deleteButtonText}>Delete Card</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212",
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#222",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#121212",
    },
    loadingText: {
      color: "white",
      marginTop: 10,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#121212",
      padding: 20,
    },
    errorText: {
      color: "white",
      fontSize: 16,
      marginTop: 10,
      marginBottom: 20,
      textAlign: "center",
    },
    backButton: {
      backgroundColor: "#8A2BE2",
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 8,
    },
    backButtonText: {
      color: "white",
      fontWeight: "bold",
    },
    cardContainer: {
      padding: 20,
    },
    card: {
      backgroundColor: "#1E1E1E",
      borderRadius: 16,
      padding: 20,
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
      marginBottom: 20,
    },
    cardType: {
      color: "#8A2BE2",
      fontSize: 14,
      fontWeight: "bold",
    },
    cardNumber: {
      color: "white",
      fontSize: 18,
      letterSpacing: 2,
      marginBottom: 20,
    },
    cardDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    detailLabel: {
      color: "#888",
      fontSize: 12,
      marginBottom: 5,
    },
    detailValue: {
      color: "white",
      fontSize: 14,
    },
    amountContainer: {
      borderTopWidth: 1,
      borderTopColor: "#333",
      paddingTop: 15,
    },
    amountLabel: {
      color: "#888",
      fontSize: 12,
      marginBottom: 5,
    },
    amountValue: {
      color: "#8A2BE2",
      fontSize: 20,
      fontWeight: "bold",
    },
    warningContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 59, 48, 0.1)",
      padding: 15,
      marginHorizontal: 20,
      borderRadius: 8,
    },
    warningText: {
      color: "#ff3b30",
      fontSize: 14,
      marginLeft: 10,
      flex: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      padding: 20,
      marginTop: "auto",
    },
    cancelButton: {
      flex: 1,
      backgroundColor: "#333",
      borderRadius: 8,
      paddingVertical: 15,
      alignItems: "center",
      marginRight: 10,
    },
    cancelButtonText: {
      color: "white",
      fontSize: 16,
    },
    deleteButton: {
      flex: 2,
      backgroundColor: "#ff3b30",
      borderRadius: 8,
      paddingVertical: 15,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    deleteButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    deleteIcon: {
      marginRight: 10,
    },
  })
  
  export default DeleteCardScreen
  
  
