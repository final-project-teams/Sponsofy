import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Share,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Text, Divider, Button, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Company } from '../services/api/companyApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import * as Clipboard from 'expo-clipboard';

type RootStackParamList = {
  CompanyProfile: { company: Company };
  ShareProfile: { company: Company };
};

type ShareProfileScreenRouteProp = RouteProp<RootStackParamList, 'ShareProfile'>;

export default function ShareProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ShareProfileScreenRouteProp>();
  const { currentTheme } = useTheme();
  const { company } = route.params;
  
  const [personalMessage, setPersonalMessage] = useState('');
  
  // Generate profile URL
  const profileUrl = `https://sponsofy.com/company/${company.id}`;
  
  // Handle share via platform
  const handleShareViaPlatform = async (platform: string) => {
    try {
      let message = `Check out ${company.name} on Sponsofy!`;
      if (personalMessage) {
        message = `${personalMessage}\n\n${message}`;
      }
      
      const shareOptions = {
        title: `${company.name} on Sponsofy`,
        message,
        url: profileUrl,
      };
      
      // Default share dialog
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share profile');
    }
  };
  
  // Copy link to clipboard using Expo's Clipboard API
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(profileUrl);
      Alert.alert('Success', 'Link copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy link to clipboard');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>
          Share {company.name}'s Profile
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.colors.textSecondary }]}>
          Choose how you want to share this company profile
        </Text>
      </View>
      
      <View style={styles.messageContainer}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          Add a personal message
        </Text>
        <TextInput
          value={personalMessage}
          onChangeText={setPersonalMessage}
          placeholder="Write a message to include with your share..."
          multiline
          numberOfLines={3}
          style={[styles.messageInput, { backgroundColor: currentTheme.colors.surface }]}
          placeholderTextColor={currentTheme.colors.textSecondary}
          theme={{
            colors: {
              primary: currentTheme.colors.primary,
              text: currentTheme.colors.text,
              placeholder: currentTheme.colors.textSecondary,
              background: currentTheme.colors.surface
            }
          }}
        />
      </View>
      
      <Divider style={styles.divider} />
      
      <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
        Share via
      </Text>
      
      <View style={styles.shareOptions}>
        <TouchableOpacity 
          style={[styles.shareOption, { backgroundColor: currentTheme.colors.surface }]}
          onPress={() => handleShareViaPlatform('general')}
        >
          <Icon name="share-variant" size={30} color={currentTheme.colors.primary} />
          <Text style={[styles.shareOptionText, { color: currentTheme.colors.text }]}>Share Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.shareOption, { backgroundColor: currentTheme.colors.surface }]}
          onPress={copyToClipboard}
        >
          <Icon name="content-copy" size={30} color={currentTheme.colors.primary} />
          <Text style={[styles.shareOptionText, { color: currentTheme.colors.text }]}>Copy Link</Text>
        </TouchableOpacity>
      </View>
      
      <Button
        mode="contained"
        onPress={() => handleShareViaPlatform('general')}
        style={[styles.shareButton, { backgroundColor: currentTheme.colors.primary }]}
        labelStyle={{ color: currentTheme.colors.white }}
      >
        Share Now
      </Button>
      
      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        style={[styles.cancelButton, { borderColor: currentTheme.colors.border }]}
        labelStyle={{ color: currentTheme.colors.text }}
      >
        Cancel
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  messageContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  messageInput: {
    borderRadius: 8,
  },
  divider: {
    marginVertical: 24,
  },
  shareOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  shareOption: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  shareOptionText: {
    marginTop: 8,
    fontSize: 14,
  },
  shareButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  cancelButton: {
    marginBottom: 40,
    paddingVertical: 8,
  },
}); 