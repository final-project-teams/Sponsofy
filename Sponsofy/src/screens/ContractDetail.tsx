import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';

// Define the contract interface
interface Contract {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'pending' | 'completed' | 'terminated';
  payment_terms: string;
  rank?: 'plat' | 'gold' | 'silver';
  budget?: string;
  company_id?: number;
  content_creator_id?: number;
  contentCreator?: {
    first_name: string;
    last_name: string;
  };
}

type RootStackParamList = {
  ContractDetail: { contract: Contract };
};

type ContractDetailRouteProp = RouteProp<RootStackParamList, 'ContractDetail'>;

const ContractDetailScreen = () => {
  const route = useRoute<ContractDetailRouteProp>();
  const navigation = useNavigation();
  const { contract } = route.params;
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color based on contract status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'terminated':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  // Handle accept contract
  const handleAcceptContract = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Contract Accepted",
        "You have successfully accepted this contract.",
        [{ text: "OK" }]
      );
    }, 1500);
  };

  // Handle reject contract
  const handleRejectContract = () => {
    Alert.alert(
      "Reject Contract",
      "Are you sure you want to reject this contract?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reject", 
          style: "destructive",
          onPress: () => {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
              setLoading(false);
              Alert.alert(
                "Contract Rejected",
                "You have rejected this contract.",
                [{ 
                  text: "OK",
                  onPress: () => navigation.goBack()
                }]
              );
            }, 1500);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar barStyle={currentTheme.colors.text === '#FFFFFF' ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: currentTheme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>Contract Details</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="dots-vertical" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.contentContainer}>
        {/* Contract Title Section */}
        <View style={[styles.section, { borderBottomColor: currentTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            {contract.title}
          </Text>
          
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(contract.status) }
          ]}>
            <Text style={styles.statusText}>
              {contract.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {/* Contract Details Section */}
        <View style={[styles.section, { borderBottomColor: currentTheme.colors.border }]}>
          <Text style={[styles.sectionHeader, { color: currentTheme.colors.textSecondary }]}>
            Description
          </Text>
          <Text style={[styles.descriptionText, { color: currentTheme.colors.text }]}>
            {contract.description}
          </Text>
        </View>
        
        {/* Contract Terms Section */}
        <View style={[styles.section, { borderBottomColor: currentTheme.colors.border }]}>
          <Text style={[styles.sectionHeader, { color: currentTheme.colors.textSecondary }]}>
            Contract Terms
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: currentTheme.colors.textSecondary }]}>
              Start Date:
            </Text>
            <Text style={[styles.detailValue, { color: currentTheme.colors.text }]}>
              {formatDate(contract.start_date)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: currentTheme.colors.textSecondary }]}>
              End Date:
            </Text>
            <Text style={[styles.detailValue, { color: currentTheme.colors.text }]}>
              {formatDate(contract.end_date)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: currentTheme.colors.textSecondary }]}>
              Payment Terms:
            </Text>
            <Text style={[styles.detailValue, { color: currentTheme.colors.text }]}>
              {contract.payment_terms}
            </Text>
          </View>
          
          {contract.budget && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: currentTheme.colors.textSecondary }]}>
                Budget:
              </Text>
              <Text style={[styles.detailValue, { color: currentTheme.colors.text }]}>
                {contract.budget}
              </Text>
            </View>
          )}
          
          {contract.rank && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: currentTheme.colors.textSecondary }]}>
                Rank:
              </Text>
              <View style={[
                styles.rankBadge, 
                { 
                  backgroundColor: 
                    contract.rank === 'plat' ? '#A0B0C0' : 
                    contract.rank === 'gold' ? '#FFD700' : 
                    '#C0C0C0' 
                }
              ]}>
                <Text style={styles.rankText}>
                  {contract.rank.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
          
          {contract.contentCreator && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: currentTheme.colors.textSecondary }]}>
                Content Creator:
              </Text>
              <Text style={[styles.detailValue, { color: currentTheme.colors.text }]}>
                {contract.contentCreator.first_name} {contract.contentCreator.last_name}
              </Text>
            </View>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {contract.status === 'pending' && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAcceptContract}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="check-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Accept Contract</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleRejectContract}
                disabled={loading}
              >
                <Icon name="close-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.contactButton]}
            disabled={loading}
          >
            <Icon name="message-text" size={20} color="#FFFFFF" />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '500',
    width: 120,
  },
  detailValue: {
    fontSize: 15,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  contactButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
});

// Export both names for backward compatibility
export { ContractDetailScreen as default, ContractDetailScreen as ContractDetail };