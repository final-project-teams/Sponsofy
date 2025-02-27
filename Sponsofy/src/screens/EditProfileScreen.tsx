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
import { Company } from '../services/api/companyApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';

type RootStackParamList = {
  CompanyProfile: { company: Company };
  EditProfile: { company: Company };
};

type EditProfileScreenRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditProfileScreenRouteProp>();
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company>(route.params.company);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Instead of making an API call, just navigate back with the updated company
      Alert.alert('Success', 'Profile updated successfully');
      navigation.navigate('CompanyProfile', { company });
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={styles.profileImageContainer}>
        <Avatar.Text 
          size={100} 
          label={company.name.substring(0, 2).toUpperCase()}
          style={{ backgroundColor: currentTheme.colors.primary }}
        />
        <TouchableOpacity style={styles.changePhotoButton}>
          <Text style={[styles.changePhotoText, { color: currentTheme.colors.primary }]}>
            Change Photo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          label="Company Name"
          value={company.name}
          onChangeText={(text) => setCompany({ ...company, name: text })}
          style={[styles.input, { backgroundColor: currentTheme.colors.surface }]}
          mode="outlined"
          theme={{ 
            colors: { 
              primary: currentTheme.colors.primary,
              text: currentTheme.colors.text,
              placeholder: currentTheme.colors.textSecondary,
              background: currentTheme.colors.surface
            } 
          }}
        />

        <TextInput
          label="Industry"
          value={company.industry}
          onChangeText={(text) => setCompany({ ...company, industry: text })}
          style={[styles.input, { backgroundColor: currentTheme.colors.surface }]}
          mode="outlined"
          theme={{ 
            colors: { 
              primary: currentTheme.colors.primary,
              text: currentTheme.colors.text,
              placeholder: currentTheme.colors.textSecondary,
              background: currentTheme.colors.surface
            } 
          }}
        />

        <TextInput
          label="Location"
          value={company.location}
          onChangeText={(text) => setCompany({ ...company, location: text })}
          style={[styles.input, { backgroundColor: currentTheme.colors.surface }]}
          mode="outlined"
          theme={{ 
            colors: { 
              primary: currentTheme.colors.primary,
              text: currentTheme.colors.text,
              placeholder: currentTheme.colors.textSecondary,
              background: currentTheme.colors.surface
            } 
          }}
        />

        <TextInput
          label="Website"
          value={company.website}
          onChangeText={(text) => setCompany({ ...company, website: text })}
          style={[styles.input, { backgroundColor: currentTheme.colors.surface }]}
          mode="outlined"
          theme={{ 
            colors: { 
              primary: currentTheme.colors.primary,
              text: currentTheme.colors.text,
              placeholder: currentTheme.colors.textSecondary,
              background: currentTheme.colors.surface
            } 
          }}
        />

        <TextInput
          label="Description"
          value={company.description || ''}
          onChangeText={(text) => setCompany({ ...company, description: text })}
          style={[styles.input, { backgroundColor: currentTheme.colors.surface }]}
          multiline
          numberOfLines={4}
          mode="outlined"
          theme={{ 
            colors: { 
              primary: currentTheme.colors.primary,
              text: currentTheme.colors.text,
              placeholder: currentTheme.colors.textSecondary,
              background: currentTheme.colors.surface
            } 
          }}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
          color={currentTheme.colors.primary}
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
  changePhotoButton: {
    marginTop: 10,
  },
  changePhotoText: {
    fontSize: 16,
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