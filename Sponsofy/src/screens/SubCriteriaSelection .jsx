import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../config/axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubCriteriaSelection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { criteriaId, platform, criteriaName } = route.params;
  const [subCriteria, setSubCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubCriteria();
  }, []);

  const fetchSubCriteria = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/user/sub-criteria?criteriaId=${criteriaId}`);
      setSubCriteria(response.data.subCriteria);
    } catch (error) {
      console.error("Error fetching sub-criteria:", error);
      Alert.alert("Error", "Failed to load sub-criteria");
    } finally {
      setLoading(false);
    }
  };

  // In the handleSelectSubCriteria function
const handleSelectSubCriteria = async (subCriteriaId, subCriteriaName) => {
    setSubmitting(true);
    try {
      console.log("Sending request to associate subcriteria:", {
        subCriteriaId,
        value: platform,
        notes: `Selected from ${platform} platform for criteria: ${criteriaName}`
      });
      const token = await AsyncStorage.getItem("userToken")
      // Make sure to include the Authorization header with the token
      const response = await api.post('/user/associate-subcriteria', {
        subCriteriaId,
        value: platform,
        notes: `Selected from ${platform} platform for criteria: ${criteriaName}`
      }, {
        headers: {
          'Authorization': `Bearer ${token}` // Make sure you have access to the token
        }
      });
      
      console.log("Association response:", response.data);
      
      Alert.alert(
        "Success", 
        `You've selected ${subCriteriaName} for ${platform}`,
        [{ text: "OK", onPress: () => navigation.navigate("ProfileContent") }]
      );
    } catch (error) {
      console.error("Error associating sub-criteria:", error);
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      Alert.alert("Error", "Failed to save your selection");
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Sub-Criteria</Text>
      <Text style={styles.subtitle}>
        For {criteriaName} on {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#8A2BE2" style={styles.loader} />
      ) : (
        <FlatList
          data={subCriteria}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.subCriteriaButton}
              onPress={() => handleSelectSubCriteria(item.id, item.name)}
              disabled={submitting}
            >
              <Text style={styles.subCriteriaButtonText}>{item.name}</Text>
              {item.description && (
                <Text style={styles.subCriteriaDescription}>{item.description}</Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No sub-criteria available for this criteria. Please add some sub-criteria first.
            </Text>
          }
        />
      )}
      
      {submitting && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={styles.overlayText}>Saving your selection...</Text>
        </View>
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
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  loader: {
    marginTop: 50,
  },
  subCriteriaButton: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  subCriteriaButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  subCriteriaDescription: {
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
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  }
});

export default SubCriteriaSelection;