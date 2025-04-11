import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api'; // Adjust the import based on your project structure

const ContentCreatorDealsScreen = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContentCreatorDeals = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        const response = await api.get("/deal/creator/deals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setDeals(response.data.deals);
        } else {
          Alert.alert("Error", response.data.message || "Failed to fetch deals");
        }
      }
    } catch (error) {
      console.error("Error fetching content creator deals:", error);
      Alert.alert("Error", "Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentCreatorDeals();
  }, []);

  const renderDealItem = ({ item }) => (
    <View style={styles.dealItem}>
      <Text style={styles.dealTitle}>Deal ID: {item.id}</Text>
      <Text>Deal Terms: {item.deal_terms}</Text>
      <Text>Price: ${item.price.toFixed(2)}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Created At: {new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={deals}
          renderItem={renderDealItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  dealItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default ContentCreatorDealsScreen;