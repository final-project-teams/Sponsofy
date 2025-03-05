import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ContractDetail = ({ route }) => {
  const { contract } = route.params; // Get the contract data passed from HomeScreen

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.contentContainer}>
        {/* User Info Section */}
        <View style={styles.userInfoContainer}>
         
          <View style={styles.userInfo}>
            <Text style={styles.username}>{contract.title}</Text>
            <Text style={styles.timestamp}>{contract.start_date}</Text>
          </View>
        </View>
        
        {/* Content Section */}
        <View style={styles.postContentContainer}>
          <Text style={styles.mainContent}>{contract.description}</Text>
          
          {/* Budget */}
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Budget: </Text>
            <Text style={styles.budgetAmount}>{contract.budget || 'N/A'}</Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="check-decagram" size={22} color="white" />
            <Text style={styles.actionButtonText}>Accept Deal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="message-circle" size={22} color="white" />
            <Text style={styles.actionButtonText}>Comments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="phone" size={22} color="white" />
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
    backgroundColor: '#000',
  },
  contentContainer: {
    flex: 1,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'column',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#777',
    fontSize: 12,
  },
  postContentContainer: {
    paddingHorizontal: 16,
  },
  mainContent: {
    color: 'white',
    fontSize: 15,
    marginBottom: 14,
  },
  budgetContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  budgetLabel: {
    color: '#777',
    fontSize: 14,
  },
  budgetAmount: {
    color: 'white',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.2,
    borderTopColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
});

export default ContractDetail;