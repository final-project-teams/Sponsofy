"use client"

import React from "react"
import { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import api from "../config/axios"

type DealData = {
  title: string
  price: string
  deal_terms: string
  description: string
}

type RootStackParamList = {
  // Define your navigation stack params here
  // Example:
  // Home: undefined;
  // Profile: { userId: string };
  [key: string]: undefined | object
}

const AddDealContentCreator = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [loading, setLoading] = useState<boolean>(false)
  const [dealData, setDealData] = useState<DealData>({
    title: "",
    price: "",
    deal_terms: "",
    description: "",
  })

  // Handle input changes
  const handleChange = (field: keyof DealData, value: string) => {
    setDealData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle deal submission
  const handleSubmit = async () => {
    // Basic validation
    if (!dealData.title || !dealData.price) {
      Alert.alert("Error", "Please provide at least a title and price for the deal")
      return
    }

    try {
      setLoading(true)
      const token = await AsyncStorage.getItem("userToken")

      if (!token) {
        Alert.alert("Error", "You need to be logged in to create a deal")
        return
      }

      // Create the deal
      const response = await api.post(
        "/api/deals",
        {
          ...dealData,
          price: Number.parseFloat(dealData.price),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      
      Alert.alert("Success", "Deal created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error: any) {
      console.error("Error creating deal:", error)
      Alert.alert("Error", error.response?.data?.message || "Failed to create deal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Deal</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Deal Title*</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter deal title"
                placeholderTextColor="#666"
                value={dealData.title}
                onChangeText={(text) => handleChange("title", text)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Price ($)*</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                placeholderTextColor="#666"
                value={dealData.price}
                onChangeText={(text) => handleChange("price", text)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Deal Terms</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter deal terms"
                placeholderTextColor="#666"
                value={dealData.deal_terms}
                onChangeText={(text) => handleChange("deal_terms", text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter description"
                placeholderTextColor="#666"
                value={dealData.description}
                onChangeText={(text) => handleChange("description", text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Create Deal</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#222",
    color: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: "#8A2BE2",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default AddDealContentCreator