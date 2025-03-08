import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { contractService, searchService } from "../services/api";
import ChatScreen from './ChatScreen';
import BottomNavBar from '../components/BottomNavBar';
import Header from '../components/Header';

import { RootStackParamList, HomeScreenNavigationProp } from "../navigation/types"; // Adjust the path as necessary

import { RouteProp } from '@react-navigation/native';

const HomeScreen: React.FC<{ navigation: HomeScreenNavigationProp; route: RouteProp<RootStackParamList, 'Home'> }> = ({ navigation }) => {
  const [deals, setDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDeals = async () => {
      const response = await contractService.getContracts();
      setDeals(response);
    };
    fetchDeals();
  }, []);

  useEffect(() => {
    console.log("Deals state updated:", deals);
  }, [deals]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query) {
      try {
        const results = await searchService.searchContracts(query);
        console.log("Search results:", results);
  
        // Flatten the nested response data
        const flattenedResults = Object.values(results.data).flat();
        console.log("Flattened results:", flattenedResults);
  
        setDeals(flattenedResults);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    } else {
      const response = await contractService.getContracts();
      setDeals(response);
    }
  };
  const filterByRank = async (rank) => {
    try {
      const results = await searchService.searchContractsByRank(rank);
      console.log("Filtered results by rank:", results);
  
      // Flatten the nested response data
      const flattenedResults = Object.values(results.data).flat();
      console.log("Flattened results:", flattenedResults);
  
      setDeals(flattenedResults);
    } catch (error) {
      console.error("Error fetching filtered results:", error);
    }
  };
  const renderDealItem = ({ item }) => {
    // Determine the background color based on the rank
    let ribbonColor;
    switch (item.rank) {
        case 'gold':
            ribbonColor = 'gold'; // Gold color for gold rank
            break;
        case 'silver':
            ribbonColor = 'grey'; // Grey color for silver rank
            break;
        case 'plat':
            ribbonColor = '#8A2BE2'; // Purple color for platinum rank
            break;
        default:
            ribbonColor = 'red'; // Default color if rank is not recognized
    }

    return (
        <View style={styles.dealCard}>
            {/* User profile and time */}
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.userAvatar} />
                    <View>
                        <Text style={styles.username}>{item.title}</Text>
                        <Text style={styles.timeAgo}>{item.start_date}</Text>
                    </View>
                </View>

                {/* Status ribbon with rank */}
                <View style={[styles.statusRibbon, { backgroundColor: ribbonColor }]}>
                   
                    <Text style={styles.rankText}>{item.rank}</Text>
                </View>
            </View>

            {/* Deal description */}
            <Text style={styles.dealDescription}>{item.description}</Text>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('DealDetails', { dealId: 1 })}>
                    <Ionicons name="information-circle-outline" size={20} color="#666" />
                    <Text style={styles.actionButtonText}>View Deal</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={20} color="#666" />
                    <Text style={styles.actionButtonText}>Comments</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="call-outline" size={20} color="#666" />
                    <Text style={styles.actionButtonText}>Contact</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Reusable Header Component */}
      <Header 
        title="Sponsofy" 
      />

      {/* Add Person Icon for Profile Navigation */}
   

  

      {/* Deals title and search */}
      <View style={styles.dealsHeader}>
        <Text style={styles.dealsTitle}>Contracts</Text>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.filterButton} onPress={() => filterByRank('gold')}>
            <Text style={styles.filterText}>Gold</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => filterByRank('silver')}>
            <Text style={styles.filterText}>Silver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => filterByRank('plat')}>
            <Text style={styles.filterText}>Plat</Text>
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="search..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>
      </View>

      {/* Deals list */}
      <FlatList
        data={deals}
        renderItem={renderDealItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.dealsList}
      />

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  dealsHeader: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  dealsTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  dealsList: {
    paddingHorizontal: 15,
  },
  dealCard: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#888',
    marginRight: 10,
  },
  username: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  timeAgo: {
    color: '#666',
    fontSize: 12,
    marginLeft: 10,
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
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    transform: [{ rotate: '-45deg' }],
  },
  dealDescription: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 5,
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  profileButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  premiumButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
});

export default HomeScreen;