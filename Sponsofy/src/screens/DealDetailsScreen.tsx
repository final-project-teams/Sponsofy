import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/axios';
import { useSocket } from "../context/socketContext";

const DealDetailsScreen = ({ route, navigation }) => {
  const {dealSocket} = useSocket();
  const { dealId } = route.params;
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await api.get(`/addDeal/${dealId}`);
        setDeal(response.data.deal);
        console.log("deaaaaaaaalllllllllllo",response.data.deal);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  const handleAcceptDeal = async () => {
    // Show confirmation dialog first
    Alert.alert(
      "Confirm Deal Acceptance",
      "Are you sure you want to accept this deal?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Accept",
          onPress: async () => {
            try {
              setLoading(true);
              console.log("Accepting deal for contract:", deal.id);
              
              // Show loading indicator or disable button here if needed
              const response = await api.post('/addDeal/request', {
                companyId: deal.Company.id,
                termstermsList: deal.Terms,
                contractId: deal.id,
                price: deal.amount || 0 // Use the contract amount or default to 0
              });
              dealSocket.emit("send_deal_request", response.data.deal)
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
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C4DFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF4D4D" />
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
        <View style={styles.headerContent}>

          {/* Add Ribbon */}
          {deal?.rank && (
            <View style={[
              styles.ribbon, 
              { backgroundColor: 
                deal.rank === 'gold' ? 'gold' :
                deal.rank === 'silver' ? 'grey' :
                deal.rank === 'plat' ? '#8A2BE2' : 'red'
              }
            ]}>
              <Text style={styles.ribbonText}>{deal.rank}</Text>
            </View>
          )}
          <Text style={styles.mainTitle}>{deal?.title}</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{deal?.description}</Text>
          </View>
          
        </View>
        </View>
 {/* Criteria Section */}
 <View style={styles.criteriaSection}>
          <Text style={styles.criteriaTitle}>Criteria</Text>
          <View style={styles.criteriaContainer}>
          {deal.criteria.map((item:any) => (
            <View style={styles.criteriaItem} key={item?.id }>
              <Text style={styles.criteriaValue}>{item.name}</Text>
              <Text style={styles.criteriaLabel}>{item.description}</Text>
            </View>))}
           
           
          </View>
        </View>
        <View style={styles.contractSection}>
          <Text style={styles.contractTitle}>Contract</Text>
          <View style={styles.contractGrid}>
            <View style={styles.contractItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.contractLabel}>Starting Time</Text>
              <Text style={styles.contractValue}>{new Date(deal?.start_date).toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.contractItem}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={styles.contractLabel}>Budget</Text>
              <Text style={styles.contractValue}>{deal?.amount || '2000'}</Text>
            </View>
            
            <View style={styles.contractItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.contractLabel}>Ending Time</Text>
              <Text style={styles.contractValue}>{new Date(deal?.end_date).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

      

        {/* Company Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business" size={24} color="#7C4DFF" />
            <Text style={styles.cardTitle}>Company Details</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{deal?.Company?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Industry</Text>
              <Text style={styles.infoValue}>{deal?.Company?.industry || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{deal?.Company?.category || 'Not specified'}</Text>
            </View>
          </View>
        </View>

        {/* Terms Section */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms</Text>
          <View style={styles.termsList}>
          {deal.Terms.map((term, index) => (
            <Text key={term?.id || index} style={styles.termItem}>{term?.description}</Text>
            ))}
            <TouchableOpacity onPress={() => console.log('See more')}>
              <Text style={styles.seeMoreText}>see more</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleAcceptDeal}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Accept Deal</Text>
          </TouchableOpacity>
          
          <View style={styles.buttonDivider} />
          
          <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Contact Company')}>
            <Ionicons name="call" size={24} color="#666" />
            <Text style={[styles.actionButtonText, { color: '#666' }]}>Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    flex: 1,
    paddingRight: 48, // Make space for the badge
  },
  ribbon: {
    position: 'absolute',
    top: -30,
    right: -60,
    width: 150,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  ribbonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  criteriaSection: {
    marginBottom: 24,
  },
  criteriaTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  criteriaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  criteriaItem: {
    alignItems: 'center',
    flex: 1,
  },
  criteriaValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  criteriaLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  termsSection: {
    marginBottom: 24,
  },
  termsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  termsList: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  termItem: {
    color: '#fff',
    fontSize: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  seeMoreText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  headerSection: {
    position: 'relative',
    overflow: 'hidden',
    padding: 16,
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 28,
    
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 16,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  keyInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  keyInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  keyInfoDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  keyInfoValue: {
    color: '#7C4DFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  keyInfoLabel: {
    color: '#888',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  termTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  termDescription: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#333',
    marginHorizontal: 16,
  },
  secondaryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#7C4DFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  contractSection: {
    marginBottom: 24,
  },
  contractTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  contractGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  contractItem: {
    alignItems: 'center',
    flex: 1,
  },
  contractLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  contractValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default DealDetailsScreen;