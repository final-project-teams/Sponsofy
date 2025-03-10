import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/axios';

const DealDetailsScreen = ({ route, navigation }) => {
  const { dealId } = route.params;
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await api.get(`/addDeal/${dealId}`);
        setDeal(response.data.deal);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  const handleAcceptDeal = async () => {
    try {
      setLoading(false);
      console.log("Accepting deal for contract:", deal.id);
      
      // Show loading indicator or disable button here if needed
      const response = await api.post('/addDeal/request', {
        contractId: deal.id,
        price: deal.amount || 0 // Use the contract amount or default to 0
      });
      
      console.log("Accept deal response:", response.data);
      setLoading(false);
      if (response.data.success) {
        Alert.alert(
          "Success",
          "Deal accepted successfully!",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Error", response.data.message || "Failed to accept deal");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error accepting deal:", error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        // Show more specific error message
        Alert.alert(
          "Error",
          error.response.data.message || 
          `Server error (${error.response.status}): Please try again later`
        );
      } else {
        Alert.alert(
          "Error",
          "Network error: Please check your connection and try again"
        );
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#cc0000" />
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  // Determine the background color based on the rank
  let ribbonColor;
  switch (deal?.rank) {
    case 'gold':
      ribbonColor = 'gold';
      break;
    case 'silver':
      ribbonColor = 'grey';
      break;
    case 'plat':
      ribbonColor = '#8A2BE2';
      break;
    default:
      ribbonColor = 'red';
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{deal?.title}</Text>
          <View style={[styles.statusRibbon, { backgroundColor: ribbonColor }]}>
            <Text style={styles.rankText}>{deal?.rank}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contract Details</Text>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Description:</Text>
            <Text style={styles.infoValue}>{deal?.description}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Start Date:</Text>
            <Text style={styles.infoValue}>{new Date(deal?.start_date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>End Date:</Text>
            <Text style={styles.infoValue}>{new Date(deal?.end_date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{deal?.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Payment Terms:</Text>
            <Text style={styles.infoValue}>{deal?.payment_terms || 'Not specified'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Company Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{deal?.Company?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Industry:</Text>
            <Text style={styles.infoValue}>{deal?.Company?.industry || 'Not specified'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Category:</Text>
            <Text style={styles.infoValue}>{deal?.Company?.category || 'Not specified'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={20} color="#555" />
            <Text style={styles.infoLabel}>Code Fiscal:</Text>
            <Text style={styles.infoValue}>{deal?.Company?.codeFiscal || 'Not specified'}</Text>
          </View>
        </View>

        {deal?.Terms && deal.Terms.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Terms</Text>
            {deal.Terms.map((term, index) => (
              <View key={term?.id || index} style={styles.termItem}>
                <Text style={styles.termTitle}>{term?.title}</Text>
                <Text style={styles.termDescription}>{term?.description}</Text>
                <View style={styles.termStatusContainer}>
                  <Text style={styles.termStatusLabel}>Status:</Text>
                  <Text style={[styles.termStatus, { color: term?.status === 'negotiating' ? '#ff9900' : '#00cc66' }]}>
                    {term?.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Action Buttons Section */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleAcceptDeal}
          >
            <Ionicons name="checkmark-circle" size={24} color="#00cc66" />
            <Text style={styles.actionButtonText}>Accept Deal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Negotiate Terms')}>
            <Ionicons name="git-compare" size={24} color="#ff9900" />
            <Text style={styles.actionButtonText}>Negotiate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Contact Company')}>
            <Ionicons name="chatbubble" size={24} color="#0099ff" />
            <Text style={styles.actionButtonText}>Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  scrollContent: {
    padding: 16,
  },
  headerContainer: {
    position: 'relative',
    marginBottom: 20,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statusRibbon: {
    position: 'absolute',
    top: -15,
    right: -50,
    width: 130,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#aaa',
    marginLeft: 8,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  termItem: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  termTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  termDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  termStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termStatusLabel: {
    fontSize: 14,
    color: '#aaa',
    marginRight: 5,
  },
  termStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Action Buttons Styles
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
});

export default DealDetailsScreen;