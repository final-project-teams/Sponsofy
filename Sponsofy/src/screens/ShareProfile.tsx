import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';

type RootStackParamList = {
  ShareProfile: { company: any };
  CompanyProfile: { company: any };
};

type ShareProfileRouteProp = RouteProp<RootStackParamList, 'ShareProfile'>;
type ShareProfileNavigationProp = StackNavigationProp<RootStackParamList>;

const ShareProfile = () => {
  const { currentTheme, isDarkMode } = useTheme();
  const route = useRoute<ShareProfileRouteProp>();
  const navigation = useNavigation<ShareProfileNavigationProp>();
  const { company } = route.params;

  useEffect(() => {
    // Automatically trigger share when the screen loads
    handleShare();
  }, []);

  const handleShare = async () => {
    try {
      const shareOptions = {
        title: `${company.name} Profile`,
        message: `Check out ${company.name}'s profile on Sponsofy!\n\n${company.industry} • ${company.location}\n\n${company.description || 'No description available.'}`,
        url: company.website || 'https://sponsofy.com/profile/' + company.id,
      };
      
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
      
      // Navigate back to company profile after sharing (or dismissing)
      navigation.goBack();
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Error', 'Could not share profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Share Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#8A2BE2" />
        <Text style={[styles.text, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          Opening share options...
        </Text>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Icon name="share-variant" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(138, 43, 226, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#8A2BE2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#8A2BE2',
    fontWeight: '500',
  },
});

export default ShareProfile; 