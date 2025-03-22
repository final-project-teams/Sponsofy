import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../config/axios";

const CriteriaSelection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { platform } = route.params;
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCriteria();
  }, []);

  // Fetch all criteria regardless of platform
  const fetchAllCriteria = async () => {
    setLoading(true);
    try {
      console.log("Fetching all criteria");
      const response = await api.get(`/user/all-criteria`);
      console.log("Criteria response:", response.data);
      setCriteria(response.data.criteria || []);
    } catch (error) {
      console.error("Error fetching criteria:", error);
      Alert.alert("Error", "Failed to load criteria");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCriteria = async (criteriaId, criteriaName) => {
    setLoading(true);
    try {
      console.log("Associating platform:", platform, "with criteria:", criteriaId);
      
      // Updated to use the criteriaId in the URL path
      const response = await api.post(`/user/associate-platform-criteria/${criteriaId}`, {
        platform
      });
      
      console.log("Association response:", response.data);
      
      // Navigate to subcriteria selection
      navigation.navigate("SubCriteriaSelection", { 
        criteriaId, 
        platform,
        criteriaName 
      });
    } catch (error) {
      console.error("Error associating platform with criteria:", error);
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      Alert.alert("Error", "Failed to associate platform with criteria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Criteria for {platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#8A2BE2" style={styles.loader} />
      ) : (
        <FlatList
          data={criteria}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.criteriaButton}
              onPress={() => handleSelectCriteria(item.id, item.name)}
              disabled={loading}
            >
              <Text style={styles.criteriaButtonText}>{item.name}</Text>
              {item.description && (
                <Text style={styles.criteriaDescription}>{item.description}</Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No criteria available. Please add some criteria first.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loader: {
    marginTop: 50,
  },
  criteriaButton: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  criteriaButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  criteriaDescription: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  emptyText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  }
});

export default CriteriaSelection;