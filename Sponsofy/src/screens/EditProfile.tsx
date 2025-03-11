import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar } from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';
import { Company } from '../types/company';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/axios';
import { companyService } from '../services/api';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  EditProfile: { company: Company };
  CompanyProfile: { company: Company };
};

type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;
type EditProfileNavigationProp = StackNavigationProp<RootStackParamList>;

type FormData = {
  name: string;
  industry: string;
  location: string;
  description: string;
  website: string;
  codeFiscal: string;
  category: string;
  email: string;
  phone: string;
  foundedYear: number;
  employeeCount: number;
  socialMedia: {
    linkedin: string;
    twitter: string;
  };
  status: 'active' | 'inactive' | 'pending';
};

const EditProfile = () => {
  const { currentTheme, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation<EditProfileNavigationProp>();
  const route = useRoute<EditProfileRouteProp>();
  const { company } = route.params;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [formData, setFormData] = useState<FormData>({
    name: company?.name || '',
    industry: company?.industry || '',
    location: company?.location || '',
    description: company?.description || '',
    website: company?.website || '',
    codeFiscal: company?.codeFiscal || '',
    category: company?.category || '',
    email: company?.email || '',
    phone: company?.phone || '',
    foundedYear: company?.foundedYear || new Date().getFullYear(),
    employeeCount: company?.employeeCount || 0,
    socialMedia: {
      linkedin: (company?.socialMedia as any)?.linkedin || '',
      twitter: (company?.socialMedia as any)?.twitter || ''
    },
    status: company?.status || 'active'
  });
  const [userId, setUserId] = useState<string | null>(null);

  // Load user ID from storage
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          console.log('User ID loaded:', storedUserId);
        }
      } catch (error) {
        console.error('Error loading user ID:', error);
      }
    };
    
    loadUserId();
  }, []);

  const handleChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof FormData] as Record<string, any>;
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.name) {
        Alert.alert('Error', 'Company name is required');
        setLoading(false);
        return;
      }
      
      // Validate email format if provided
      if (formData.email && !validateEmail(formData.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        setLoading(false);
        return;
      }
      
      // Get the authentication token and user ID
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token) {
        Alert.alert('Authentication Error', 'You must be logged in to update your profile');
        setLoading(false);
        return;
      }
      
      // Create updated company object with proper typing
      const updatedCompany: Company = {
        ...company, // Keep existing data
        id: company.id || '',
        name: formData.name,
        industry: formData.industry,
        location: formData.location,
        description: formData.description,
        website: formData.website,
        codeFiscal: formData.codeFiscal,
        category: formData.category,
        email: formData.email || null, // Use null instead of empty string
        phone: formData.phone,
        foundedYear: formData.foundedYear,
        employeeCount: formData.employeeCount,
        socialMedia: formData.socialMedia,
        status: formData.status,
        verified: company.verified || false,
        UserId: userId || company.UserId || undefined // Preserve existing UserId if available
      };

      console.log('Saving company data:', updatedCompany);
      
      // Save company data to AsyncStorage first for offline access
      await AsyncStorage.setItem('companyData', JSON.stringify(updatedCompany));
      
      // Check if we're creating a new company or updating an existing one
      if (!company.id) {
        // Creating a new company
        try {
          console.log('Creating new company on server...');
          const response = await companyService.createCompany(updatedCompany);
          console.log('Company created successfully:', response);
          
          // Update the company ID with the one from the server
          if (response && response.id) {
            updatedCompany.id = response.id;
            // Save the updated company data with the new ID
            await AsyncStorage.setItem('companyData', JSON.stringify(updatedCompany));
            // Convert ID to string before storing
            await AsyncStorage.setItem('companyId', String(response.id));
          }
          
          // Show success message
          Alert.alert('Success', 'Company profile created successfully');
        } catch (createError) {
          console.error('Error creating company:', createError);
          
          // Show warning but continue with local data
          Alert.alert(
            'Warning',
            'Your company profile has been saved locally but could not be saved to the server. Some features may be limited.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Updating an existing company
        try {
          console.log('Updating existing company on server...');
          const response = await companyService.updateCompany(company.id, updatedCompany);
          console.log('Company updated successfully:', response);
          
          // Show success message
          Alert.alert('Success', 'Company profile updated successfully');
        } catch (updateError) {
          console.error('Error updating company:', updateError);
          
          // Show warning but continue with local data
          Alert.alert(
            'Warning',
            'Your changes have been saved locally but could not be updated on the server. The app will continue to work with your changes.',
            [{ text: 'OK' }]
          );
        }
      }
      
      // Navigate back to the company profile with the updated company
      navigation.navigate('CompanyProfile', { company: updatedCompany });
    } catch (error) {
      console.error('Error in save operation:', error);
      Alert.alert('Error', `Failed to save company profile: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const renderSectionButton = (section: string, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.sectionButton,
        { 
          backgroundColor: activeSection === section 
            ? currentTheme.colors.primary 
            : isDarkMode ? 'rgba(255, 255, 255, 0.1)' : currentTheme.colors.surface,
          borderColor: activeSection === section 
            ? currentTheme.colors.primaryBorder 
            : 'transparent'
        }
      ]}
      onPress={() => setActiveSection(section)}
    >
      <Icon 
        name={icon} 
        size={20} 
        color={activeSection === section ? currentTheme.colors.white : currentTheme.colors.text} 
      />
      <Text 
        style={[
          styles.sectionButtonText, 
          { color: activeSection === section ? currentTheme.colors.white : currentTheme.colors.text }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderInput = (label: string, field: string, icon: string, options: any = {}) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: currentTheme.colors.text }]}>{label}</Text>
      <View style={[styles.inputContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Icon name={icon} size={20} color={currentTheme.colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { 
            color: currentTheme.colors.text,
            borderColor: currentTheme.colors.border
          }]}
          value={field.includes('.') ? formData[field.split('.')[0]][field.split('.')[1]] : formData[field]}
          onChangeText={(text) => handleChange(field, text)}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={currentTheme.colors.textSecondary}
          {...options}
        />
      </View>
      </View>
    );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Header Background */}
      <View style={[styles.headerBackground, { 
        backgroundColor: isDarkMode ? '#000000' : currentTheme.colors.primary 
      }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={currentTheme.colors.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.themeToggle, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
              onPress={toggleTheme}
            >
              <Icon 
                name={isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"} 
                size={24} 
                color={currentTheme.colors.white} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Section */}
      <View style={[styles.profileSection, { marginTop: -50 }]}>
        <View style={styles.avatarWrapper}>
          <Avatar.Text 
            size={100} 
            label={formData.name.substring(0, 2).toUpperCase()}
            style={[styles.avatar, {
              backgroundColor: currentTheme.colors.primary,
              borderColor: isDarkMode ? '#000000' : '#FFFFFF',
              borderWidth: 4,
              elevation: 4
            }]}
          />
          {company?.verified && (
            <View style={[styles.verificationBadge, { backgroundColor: '#00C853' }]}>
              <Icon name="check" size={18} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <Text style={[styles.profileName, { color: currentTheme.colors.text }]}>
          {formData.name || 'Your Company'}
        </Text>
        <Text style={[styles.profileDetails, { color: currentTheme.colors.textSecondary }]}>
          {formData.industry} • {formData.location}
        </Text>
      </View>

      {/* Updated Section Tabs */}
      <View style={styles.tabContainer}>
        {renderSectionButton('basic', 'Basic', 'information-outline')}
        {renderSectionButton('contact', 'Contact', 'phone-outline')}
        {renderSectionButton('company', 'Company', 'domain')}
        {renderSectionButton('social', 'Social', 'web')}
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.formContainer}>
          {activeSection === 'basic' && (
            <View style={styles.section}>
              {renderInput('Company Name', 'name', 'domain')}
              {renderInput('Industry', 'industry', 'briefcase-outline')}
              {renderInput('Category', 'category', 'tag-outline')}
              {renderInput('Location', 'location', 'map-marker-outline')}
              {renderInput('Description', 'description', 'text-box-outline', {
                multiline: true,
                numberOfLines: 4,
                style: [styles.input, styles.textArea]
              })}
            </View>
          )}

          {activeSection === 'contact' && (
            <View style={styles.section}>
              {renderInput('Email', 'email', 'email-outline', { keyboardType: 'email-address' })}
              {renderInput('Phone', 'phone', 'phone-outline', { keyboardType: 'phone-pad' })}
              {renderInput('Website', 'website', 'web', { keyboardType: 'url' })}
              {renderInput('Code Fiscal', 'codeFiscal', 'file-document-outline')}
            </View>
          )}

          {activeSection === 'company' && (
            <View style={styles.section}>
              {renderInput('Founded Year', 'foundedYear', 'calendar-outline', { 
                keyboardType: 'numeric',
                value: formData.foundedYear.toString(),
                onChangeText: (text) => handleChange('foundedYear', parseInt(text) || new Date().getFullYear())
              })}
              {renderInput('Employee Count', 'employeeCount', 'account-group-outline', { 
                keyboardType: 'numeric',
                value: formData.employeeCount.toString(),
                onChangeText: (text) => handleChange('employeeCount', parseInt(text) || 0)
              })}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: currentTheme.colors.text }]}>Status</Text>
                <View style={styles.statusContainer}>
                  {['active', 'inactive', 'pending'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        { 
                          backgroundColor: formData.status === status 
                            ? currentTheme.colors.primary 
                            : currentTheme.colors.surface,
                          borderColor: formData.status === status
                            ? currentTheme.colors.primaryBorder
                            : currentTheme.colors.border
                        }
                      ]}
                      onPress={() => handleChange('status', status)}
                    >
                      <Text style={[
                        styles.statusText,
                        { color: formData.status === status ? currentTheme.colors.white : currentTheme.colors.text }
                      ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {activeSection === 'social' && (
            <View style={styles.section}>
              {renderInput('LinkedIn', 'socialMedia.linkedin', 'linkedin', { keyboardType: 'url' })}
              {renderInput('Twitter', 'socialMedia.twitter', 'twitter', { keyboardType: 'url' })}
            </View>
          )}

      <TouchableOpacity
            style={[styles.saveButton, { 
              backgroundColor: currentTheme.colors.primary,
              opacity: loading ? 0.7 : 1
            }]}
        onPress={handleSave}
        disabled={loading}
      >
            {loading ? (
              <ActivityIndicator color={currentTheme.colors.white} />
            ) : (
              <>
                <Icon name="content-save" size={20} color={currentTheme.colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
      </TouchableOpacity>
    </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    height: 180,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    marginBottom: 12,
  },
  verificationBadge: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    right: -5,
    bottom: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EditProfile;