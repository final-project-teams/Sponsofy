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

type RootStackParamList = {
  CompanyProfile: { company: Company };
  EditProfile: { company: Company };
};

type EditProfileScreenRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditProfileScreenRouteProp>();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company>(route.params.company);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (company.id) {
        await companyApi.update(company.id, company);
        Alert.alert('Success', 'Profile updated successfully');
        navigation.navigate('CompanyProfile', { company });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Avatar.Text 
          size={100} 
          label={company.name.substring(0, 2).toUpperCase()}
          style={{ backgroundColor: '#701FF1' }}
        />
        <TouchableOpacity style={styles.changePhotoButton}>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          label="Company Name"
          value={company.name}
          onChangeText={(text) => setCompany({ ...company, name: text })}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: '#701FF1' } }}
        />

        <TextInput
          label="Industry"
          value={company.industry}
          onChangeText={(text) => setCompany({ ...company, industry: text })}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: '#701FF1' } }}
        />

        <TextInput
          label="Location"
          value={company.location}
          onChangeText={(text) => setCompany({ ...company, location: text })}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: '#701FF1' } }}
        />

        <TextInput
          label="Website"
          value={company.website}
          onChangeText={(text) => setCompany({ ...company, website: text })}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: '#701FF1' } }}
        />

        <TextInput
          label="Description"
          value={company.description || ''}
          onChangeText={(text) => setCompany({ ...company, description: text })}
          style={styles.input}
          multiline
          numberOfLines={4}
          mode="outlined"
          theme={{ colors: { primary: '#701FF1' } }}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
          color="#701FF1"
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
    backgroundColor: '#000',
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
    color: '#701FF1',
    fontSize: 16,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 40,
  },
}); 