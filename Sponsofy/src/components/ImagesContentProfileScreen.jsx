import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Modal, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api'; // Adjust the import based on your project structure

const InstagramLikeGallery = ({ platform }) => {
  const [mediaLinks, setMediaLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        const response = await api.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const statsResponse = await api.get(`/user/${response.data.user.id}/social-media`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Filter out media links for this platform
        const links = statsResponse.data.stats.filter(
          (item) => item.platform === platform && item.file_format === 'image'
        );
        setMediaLinks(links);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [platform]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => {
        setSelectedMedia(item);
        setModalVisible(true);
      }}
    >
      <Image source={{ uri: item.file_url }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={mediaLinks}
          renderItem={renderItem}
          keyExtractor={(item) => item.file_url}
          numColumns={3}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedMedia && (
              <>
                <Image source={{ uri: selectedMedia.file_url }} style={styles.modalImage} />
                <Text>Likes: {selectedMedia.likes}</Text>
                <Text>Views: {selectedMedia.views}</Text>
                <Text>Followers: {selectedMedia.followers}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  imageContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
  },
  image: {
    flex: 1,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default InstagramLikeGallery;