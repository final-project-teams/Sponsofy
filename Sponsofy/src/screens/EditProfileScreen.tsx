import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Text, Avatar } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Company, companyApi } from '../services/api/companyApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  CompanyProfile: { company: Company; shouldRefresh?: boolean; companyId?: number };
  EditProfile: { company: Company };
  Login: undefined;
};

type EditProfileScreenRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditProfileScreenRouteProp>();
  const { currentTheme, isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company>(route.params.company);

  // Add a function to toggle dark mode
  const handleToggleTheme = () => {
    toggleTheme();
    // Save the preference to AsyncStorage
    AsyncStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Make sure we're using the correct company ID
      if (company.id) {
        // The token will be handled by the API interceptors
        const updatedCompany = await companyApi.updateCompany(company.id, company);
        Alert.alert('Success', 'Profile updated successfully');
        
        // Navigate back to profile screen with updated company data
        navigation.navigate('CompanyProfile', { 
          company: updatedCompany,
          shouldRefresh: true,
          companyId: updatedCompany.id  // Add this to ensure proper refresh
        });
      } else {
        Alert.alert('Error', 'Company ID is missing');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        Alert.alert(
          'Authentication Error', 
          'Your session has expired. Please log in again.',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Navigate to login screen
              navigation.navigate('Login');
            }
          }]
        );
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a header with back button and theme toggle
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleToggleTheme} style={{ marginRight: 16 }}>
          <Icon 
            name={isDarkMode ? "sun" : "moon"} 
            size={24} 
            color={currentTheme.colors.text} 
          />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: currentTheme.colors.surface,
      },
      headerTintColor: currentTheme.colors.text,
    });
  }, [navigation, isDarkMode, currentTheme]);

  return (
    <ScrollView style={[styles.container, { 
      backgroundColor: currentTheme.colors.background 
    }]}>
      <View style={styles.profileImageContainer}>
        <Avatar.Text 
          size={100} 
          label={company.name.substring(0, 2).toUpperCase()}
          style={{ backgroundColor: currentTheme.colors.primary }}
        />
        <TouchableOpacity style={[styles.editImageButton, { backgroundColor: currentTheme.colors.primary }]}>
          <Text style={{ color: currentTheme.colors.white, fontSize: 12 }}>
            Change Photo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.formContainer, { 
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border
      }]}>
        <TextInput
          label="Company Name"
          value={company.name}
          onChangeText={(text) => setCompany({ ...company, name: text })}
          style={[styles.input, { 
            backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
          }]}
          mode="outlined"
          textColor={isDarkMode ? '#FFFFFF' : '#000000'}
          theme={{ 
            colors: { 
              primary: currentTheme.colors.primary,
              text: isDarkMode ? '#FFFFFF' : '#000000',
              placeholder: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
              background: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
              onSurfaceVariant: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
            } 
          }}
        />

        <TextInput
          label="Industry"
          value={company.industry}
          onChangeText={(text) => setCompany({ ...company, industry: text })}
          style={[styles.input, { 
            backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
          }]}
          mode="outlined"
          textColor={isDarkMode ? '#FFFFFF' : '#000000'}
          theme={{ 
            colors: { 
              primary: currentTheme.colors.primary,
              text: isDarkMode ? '#FFFFFF' : '#000000',
              placeholder: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
              background: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
              onSurfaceVariant: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
            } 
          }}
        />

        <TextInput
          label="Location"
          value={company.location}
          onChangeText={(text) => setCompany({ ...company, location: text })}
          style={[styles.input, { 
            backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
          }]}
          mode="outlined"
          textColor={isDarkMode ? '#FFFFFF' : '#000000'}
          theme={{ 
            colors: { 
              primary: currentTheme.colors.primary,
              text: isDarkMode ? '#FFFFFF' : '#000000',
              placeholder: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
              background: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
              onSurfaceVariant: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
            } 
          }}
        />

        <TextInput
          label="Website"
          value={company.website}
          onChangeText={(text) => setCompany({ ...company, website: text })}
          style={[styles.input, { 
            backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
          }]}
          mode="outlined"
          textColor={isDarkMode ? '#FFFFFF' : '#000000'}
          theme={{ 
            colors: { 
              primary: currentTheme.colors.primary,
              text: isDarkMode ? '#FFFFFF' : '#000000',
              placeholder: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
              background: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
              onSurfaceVariant: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
            } 
          }}
        />

        <TextInput
          label="Description"
          value={company.description || ''}
          onChangeText={(text) => setCompany({ ...company, description: text })}
          style={[styles.input, { 
            backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
          }]}
          multiline
          numberOfLines={4}
          mode="outlined"
          textColor={isDarkMode ? '#FFFFFF' : '#000000'}
          theme={{ 
            colors: { 
              primary: currentTheme.colors.primary,
              text: isDarkMode ? '#FFFFFF' : '#000000',
              placeholder: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
              background: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
              onSurfaceVariant: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
            } 
          }}
        />

        <Button 
          mode="contained" 
          onPress={handleSave} 
          loading={loading}
          style={[styles.saveButton, { 
            backgroundColor: currentTheme.colors.primary,
            borderRadius: 30,
            marginTop: 20,
            marginBottom: 40,
            elevation: 2
          }]}
          labelStyle={{ 
            color: currentTheme.colors.white,
            fontSize: 16,
            fontWeight: 'bold',
            padding: 4
          }}
        >
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  editImageButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 50,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 40,
  },
}); 