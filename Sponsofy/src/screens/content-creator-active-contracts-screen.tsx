"use client"

import React from "react"
import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import api from "../config/axios"

const ContentCreatorActiveContractsScreen = ({ navigation, route }) => {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get the contentCreatorId from navigation params
  const { contentCreatorId, profile } = route.params

  useEffect(() => {
    fetchActiveContracts()
  }, [contentCreatorId])

  const fetchActiveContracts = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/contract/content-creator/${contentCreatorId}/status/active`)
      setContracts(response.data.contracts)
      console.log("Active Contracts:", response.data.contracts)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching active contracts:", err)
      setError(err.message || "Failed to load active contracts")
      setLoading(false)
    }
  }

  // Get rank color based on contract rank
  const getRankColor = (rank) => {
    switch (rank) {
      case "plat":
        return "#e5e4e2" // Platinum
      case "gold":
        return "#ffd700" // Gold
      case "silver":
        return "#c0c0c0" // Silver
      default:
        return "#95a5a6" // Gray
    }
  }

  const renderContractItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contractCard}
      onPress={() => navigation.navigate("ContractDetails", { contract: item })}
    >
      <View style={styles.contractHeader}>
        <Text style={styles.contractTitle}>{item.title}</Text>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
          <Text style={styles.rankText}>{item.rank}</Text>
        </View>
      </View>

      <View style={styles.contractInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#aaa" />
          <Text style={styles.infoLabel}>Start Date:</Text>
          <Text style={styles.infoValue}>{new Date(item.start_date).toLocaleDateString()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#aaa" />
          <Text style={styles.infoLabel}>End Date:</Text>
          <Text style={styles.infoValue}>{new Date(item.end_date).toLocaleDateString()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={16} color="#aaa" />
          <Text style={styles.infoLabel}>Company:</Text>
          <Text style={styles.infoValue}>{item.Company?.name || "Unknown"}</Text>
        </View>

        {item.amount && (
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#aaa" />
            <Text style={styles.infoLabel}>Budget:</Text>
            <Text style={styles.infoValue}>${item.amount}</Text>
          </View>
        )}
      </View>

      <View style={styles.contractFooter}>
        <TouchableOpacity
          style={styles.viewDetails}
          onPress={() => navigation.navigate("ContractDetails", { contract: item })}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#0099ff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#555" />
      <Text style={styles.emptyText}>No active contracts found</Text>
      <Text style={styles.emptySubtext}>Active contracts will appear here once you have ongoing collaborations</Text>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0099ff" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchActiveContracts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Contracts</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchActiveContracts}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contracts}
        renderItem={renderContractItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0099ff",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding at bottom for better scrolling
  },
  contractCard: {
    backgroundColor: "#222",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contractHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  contractTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginRight: 10,
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  contractInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#aaa",
    marginLeft: 8,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: "#fff",
    flex: 1,
  },
  contractFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1a1a1a",
  },
  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailsText: {
    color: "#0099ff",
    fontSize: 14,
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
})

export default ContentCreatorActiveContractsScreen

