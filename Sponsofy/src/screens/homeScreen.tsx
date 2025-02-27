import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, FlatList, StyleSheet, Modal } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from '@expo/vector-icons';
import { contractService, searchService } from "../services/api";
import { LinearGradient } from 'expo-linear-gradient';

// Define colors
const colors = {
  text: '#FFFFFF',
  primary: '#9B59B6',
  background: '#1A1A1A',
  cardBackground: '#2A2A2A',
};

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

const DealCard = ({ title, description, startDate, endDate, status, color, rank }) => {
  return (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Image style={styles.avatar} source={{ uri: "https://via.placeholder.com/50" }} />
        <View>
          <Text style={styles.username}>{title}</Text>
          <Text style={styles.time}>
            {startDate && endDate ? `${startDate} - ${endDate}` : "No dates specified"}
          </Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.rankText}>Rank: {rank || "N/A"}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button}>
          <Icon name="eye" size={14} color="#fff" />
          <Text style={styles.buttonText}> View Deal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="comments" size={14} color="#aaa" />
          <Text style={styles.actionText}> Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="phone" size={14} color="#aaa" />
          <Text style={styles.actionText}> Contact</Text>
        </TouchableOpacity>
      </View>
      {status && (
        <View style={[styles.ribbon, { backgroundColor: color || '#00BCD4' }]}> 
          <Text style={styles.ribbonText}>{status}</Text>
        </View>
      )}
    </View>
  );
};

export default function DealsScreen() {
  const [deals, setDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDeals, setFilteredDeals] = useState([]);
  const tierColors = {
    active: '#00BCD4',
    completed: '#CDAD00',
    terminated: '#A9A9A9',
  };
  const [selectedRank, setSelectedRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Fetch all deals initially
  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const response = await contractService.getContracts();
        console.log("Fetched deals:", response);
        setDeals(response);
        setFilteredDeals(response); // Initialize filteredDeals with all deals
      } catch (error) {
        console.error("Error fetching deals:", error.response ? error.response.data : error.message);
        setError("Failed to fetch deals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Handle search based on query
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() && !selectedRank) {
      setFilteredDeals(deals); // Reset to all deals if both search and rank filters are empty
      return;
    }
    
    setIsFiltering(true);
    try {
      const response = await searchService.searchContracts(searchQuery, selectedRank);
      console.log("Search results:", response);
      
      // Check if the response has the expected structure
      if (response && response.data) {
        setFilteredDeals(response.data);
      } else {
        console.warn("Unexpected response format from search API:", response);
        setFilteredDeals([]);
      }
    } catch (error) {
      console.error("Error searching contracts:", error);
      setFilteredDeals([]); // Show empty state on error
    } finally {
      setIsFiltering(false);
    }
  }, [searchQuery, selectedRank, deals]);

  // Handle filter by rank specifically
  const handleRankFilter = async (rank) => {
    setSelectedRank(rank);
    setIsFiltering(true);
    
    try {
      if (rank) {
        console.log("Filtering by rank:", rank);
        const response = await searchService.searchContractsByRank(rank);
        console.log("Rank filter results:", response);
        
        if (response && response.data) {
          setFilteredDeals(response.data);
        } else {
          console.warn("Unexpected response format from rank filter API:", response);
          setFilteredDeals([]);
        }
      } else {
        // If no rank is selected, show all deals or apply just the search query
        if (searchQuery.trim()) {
          handleSearch();
        } else {
          setFilteredDeals(deals);
        }
      }
    } catch (error) {
      console.error("Error filtering by rank:", error);
      setFilteredDeals([]);
    } finally {
      setIsFiltering(false);
    }
  };

  // Debounced version of search
  const debouncedSearch = useCallback(debounce(() => handleSearch(), 300), [handleSearch]);

  // Update search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch();
    } else if (!selectedRank) {
      // If search is cleared and no rank filter is active, show all deals
      setFilteredDeals(deals);
    }
  }, [searchQuery, debouncedSearch, deals, selectedRank]);

  const rankOptions = ['plat', 'gold', 'silver'];

  const renderRankButtons = () => {
    return (
      <View style={styles.rankFilter}>
        {rankOptions.map((rank) => (
          <TouchableOpacity
            key={rank}
            style={[
              styles.rankButton, 
              selectedRank === rank && styles.activeRankButton
            ]}
            onPress={() => handleRankFilter(rank)}
          >
            <Text style={styles.rankButtonText}>{rank}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.rankButton, 
            selectedRank === null && styles.activeRankButton
          ]}
          onPress={() => handleRankFilter(null)}
        >
          <Text style={styles.rankButtonText}>All</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render each deal as a card
  const renderItem = ({ item }) => (
    <DealCard
      title={item.title}
      description={item.description}
      startDate={item.startDate}
      endDate={item.endDate}
      status={item.status}
      color={tierColors[item.status?.toLowerCase()] || '#00BCD4'}
      rank={item.rank}
    />
  );
  if (loading) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading deals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <Text style={{ color: '#ff6b6b', fontSize: 18 }}>{error}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => window.location.reload()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#212e42', '#1a162e', '#371c43']} // Colors for the gradient
        start={{ x: 2, y: 0 }} // Start at the top left
        end={{ x: 2, y: 1 }} // End at the bottom left
        style={styles.gradientBackground}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Sponsofy</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="paper-plane-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Filter modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Filter by Rank</Text>
            {rankOptions.map((rank) => (
              <TouchableOpacity
                key={rank}
                style={[
                  styles.rankOption,
                  selectedRank === rank && styles.activeRankOption
                ]}
                onPress={() => {
                  handleRankFilter(rank);
                  setModalVisible(false);
                }}
              >
                <Text style={[
                  styles.rankOptionText,
                  selectedRank === rank && styles.activeRankOptionText
                ]}>
                  {rank.charAt(0).toUpperCase() + rank.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={[
                styles.rankOption,
                selectedRank === null && styles.activeRankOption
              ]}
              onPress={() => {
                handleRankFilter(null);
                setModalVisible(false);
              }}
            >
              <Text style={[
                styles.rankOptionText,
                selectedRank === null && styles.activeRankOptionText
              ]}>
                All Ranks
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Status indicators */}
      <View style={styles.statusContainer}>
        {isFiltering && (
          <Text style={styles.statusText}>Filtering deals...</Text>
        )}
        {selectedRank && (
          <View style={styles.activeFilterContainer}>
            <Text style={styles.activeFilterText}>
              Showing {selectedRank} rank deals
            </Text>
            <TouchableOpacity onPress={() => handleRankFilter(null)}>
              <Ionicons name="close-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Rank filter buttons */}
      {renderRankButtons()}
      
      {/* No results message */}
      {!isFiltering && filteredDeals.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={50} color="#444" />
          <Text style={styles.noResultsText}>No deals found</Text>
          <Text style={styles.noResultsSubtext}>
            {selectedRank 
              ? `No deals available with rank: ${selectedRank}`
              : 'Try adjusting your search or filters'}
          </Text>
          {(searchQuery.trim() || selectedRank) && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedRank(null);
                setFilteredDeals(deals);
              }}
            >
              <Text style={styles.resetButtonText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Deals list */}
      <FlatList
        data={filteredDeals}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          filteredDeals.length === 0 && { flexGrow: 1 }
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="add-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNav]}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    padding: 20,
    paddingBottom: 70, // Extra padding for bottom nav
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  searchBar: { 
    flexDirection: "row", 
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchInput: { 
    flex: 1, 
    backgroundColor: "#222", 
    padding: 10, 
    color: "#fff" 
  },
  searchButton: {
    backgroundColor: "#9B59B6",
    padding: 10,
    borderRadius: 5,
  },
  filterButton: { 
    backgroundColor: "#9B59B6",
    padding: 10, 
    borderRadius: 5 
  },
  statusContainer: {
    marginBottom: 10,
  },
  statusText: {
    color: '#888',
    fontStyle: 'italic',
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  activeFilterText: {
    color: '#fff',
    textTransform: 'capitalize',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: { 
    backgroundColor: colors.cardBackground, 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    position: "relative",
    borderWidth: 1, 
    borderColor: '#9B59B6',
  },
  userInfo: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 10 
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 10 
  },
  username: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  time: { 
    color: "#888" 
  },
  description: { 
    color: "#ddd", 
    marginBottom: 10 
  },
  actions: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: 'center',
  },
  button: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#9B59B6",
    padding: 8, 
    borderRadius: 5 
  },
  buttonText: { color: "#fff", marginLeft: 5 },
  actionText: { 
    color: "#aaa", 
    marginLeft: 5 
  },
  ribbon: { 
    position: "absolute", 
    top: 10, 
    right: 10, 
    padding: 5, 
    borderTopRightRadius: 10, 
    borderBottomLeftRadius: 10 
  },
  ribbonText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  bottomNav: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    paddingVertical: 10, 
    backgroundColor: "#111", 
    position: "absolute", 
    bottom: 0, 
    left: 0,
    right: 0,
    paddingBottom: 20, // Extra padding for iOS home indicator
  },
  navItem: { 
    alignItems: "center",
    padding: 10,
  },
  activeNav: { 
    borderBottomWidth: 2, 
    borderBottomColor: '#00BCD4',
  },
  rankFilter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  rankButton: {
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  activeRankButton: {
    backgroundColor: '#00BCD4',
  },
  rankButtonText: {
    color: '#fff',
    textTransform: 'capitalize',
  },
  rankText: {
    color: '#888',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  rankOption: {
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activeRankOption: {
  },
  rankOptionText: {
    fontSize: 16,
  },
  activeRankOptionText: {
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noResultsText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
  },
  noResultsSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
  },
  resetButtonText: {
    color: '#fff',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000', // Black
    opacity: 0.5, // Adjust opacity for blending
  },
  gradientOverlayRed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF0000', // Red
    opacity: 0.3, // Adjust opacity for blending
  },
  categoryContainer: {
    backgroundColor: 'transparent', // No solid background

    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  categoryButton: {
    padding: 10,
    borderRadius: 20, // Rounded corners
  },
  categoryText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  activeCategoryButton: {
    backgroundColor: 'transparent', // No solid background
    borderRadius: 20,
    padding: 10,
    overflow: 'hidden',
  },
  activeCategoryText: {
    color: '#fff', // White text for active category
  },
});