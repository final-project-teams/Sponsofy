"use client"

import { useEffect, useState } from "react"
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import api from "../config/axios"

const GetAllCardsScreen = ({ route, navigation }) => {
  const { userId } = route.params || {}
  const [cardPayments, setCardPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCardPayments()
  }, [])

  const fetchCardPayments = async () => {
    try {
      setLoading(true)
      // First try to get cards by content creator ID
      let response = await api.get(`/card-payments/content-creator/${userId}`)

      // If no cards found, try by company ID
      if (!response.data.cardPayments || response.data.cardPayments.length === 0) {
        response = await api.get(`/card-payments/company/${userId}`)
      }

      setCardPayments(response.data.cardPayments || [])
    } catch (error) {
      console.error("Error fetching card payments:", error)
      setError("Failed to load card payments")
      Alert.alert("Error", "Failed to load card payments")
    } finally {
      setLoading(false)
    }
  }

  const handleCardSelect = (cardId) => {
    navigation.navigate("UpdateCard", { id: cardId, userId })
  }

  const handleDeleteCard = (cardId) => {
    navigation.navigate("DeleteCard", { id: cardId, userId })
  }

  const renderCardItem = ({ item }) => (
    <View style={styles.cardItem}>
      <TouchableOpacity style={styles.cardContent} onPress={() => handleCardSelect(item.id)}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.cardHolderName || "Card"}</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCard(item.id)}>
            <Feather name="trash-2" size={20} color="#ff3b30" />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardNumber}>•••• •••• •••• {item.cardNumber.slice(-4)}</Text>

        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Expires</Text>
            <Text style={styles.detailValue}>{item.expirationDate}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>${Number.parseFloat(item.amount).toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCardPayments}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cards</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("PostCard", { userId })}>
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {cardPayments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="credit-card" size={50} color="#333" />
          <Text style={styles.emptyText}>No cards found</Text>
          <TouchableOpacity style={styles.addCardButton} onPress={() => navigation.navigate("PostCard", { userId })}>
            <Text style={styles.addCardButtonText}>Add a Card</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cardPayments}
          renderItem={renderCardItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8A2BE2",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 15,
  },
  cardItem: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#1E1E1E",
    overflow: "hidden",
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  deleteButton: {
    padding: 5,
  },
  cardNumber: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 15,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    color: "white",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  addCardButton: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  addCardButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default GetAllCardsScreen


