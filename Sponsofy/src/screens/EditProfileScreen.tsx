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
  Dimensions,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeProvider } from '../theme/ThemeContext';
import { useTheme as useThemeHook } from '../theme/ThemeContext';
import { Company, companyApi } from '../services/api/companyApi';

const { width } = Dimensions.get('window');

// Define navigation types
type RootStackParamList = {
  EditProfile: { company: Company };
  CompanyProfile: { company: Company };
  // Add other routes as needed
};

type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;
type EditProfileNavigationProp = StackNavigationProp<RootStackParamList>;

// Define fallback theme
const fallbackTheme = {
  colors: {
    primary: '#701FF1',
    secondary: '#B785E6',
    background: '#181818',
    surface: '#292929',
    text: '#F4F4F4',
    textSecondary: '#5F5F5F',
    primaryBorder: '#8F6AFF',
    border: '#292929',
    error: '#FF3A3A',
    white: '#F4F4F4',
    black: '#0E0E0E',
    headerBackground: '#1A1A1A',
    cardBackground: '#1A1A1A',
  }
};

// Create a hook that safely uses the theme
const useSafeTheme = () => {
  try {
    return useThemeHook();
  } catch (error) {
    // Return a default theme object if the hook fails
    return {
      currentTheme: fallbackTheme,
      isDarkMode: true,
      toggleTheme: () => console.log('Theme toggle not available')
    };
  }
};

// Create a wrapper component that includes ThemeProvider
const EditProfileScreenWithTheme: React.FC = () => {
  return (
    <ThemeProvider>
      <EditProfileScreenContent />
    </ThemeProvider>
  );
};

// Define form data interface
interface FormData {
  name: string;
  industry: string;
  location: string;
  description: string;
  website: string;
  codeFiscal: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  collaborationPreferences: {
    contentTypes: string[];
    duration: string;
    requirements: string;
  };
}

// The actual component content
const EditProfileScreenContent: React.FC = () => {
  const navigation = useNavigation<EditProfileNavigationProp>();
  const route = useRoute<EditProfileRouteProp>();
  const { company } = route.params;
  const { currentTheme } = useSafeTheme();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    industry: '',
    location: '',
    description: '',
    website: '',
    codeFiscal: '',
    budget: {
      min: 0,
      max: 0,
      currency: 'TND'
    },
    collaborationPreferences: {
      contentTypes: [],
      duration: '',
      requirements: ''
    }
  });

  useEffect(() => {
    if (company) {
      // Initialize form with company data
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        location: company.location || '',
        description: company.description || '',
        website: company.website || '',
        codeFiscal: company.codeFiscal || '',
        budget: company.budget || {
          min: 0,
          max: 0,
          currency: 'TND'
        },
        collaborationPreferences: company.collaborationPreferences || {
          contentTypes: [],
          duration: '',
          requirements: ''
        }
      });
    }
  }, [company]);

  const handleChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      // Handle nested fields (e.g., budget.min)
      const [parent, child] = field.split('.');
      setFormData(prev => {
        // Get the parent object with proper typing
        const parentObj = prev[parent as keyof FormData];
        
        // Only proceed if parentObj is an object
        if (parentObj && typeof parentObj === 'object') {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value
            }
          };
        }
        return prev;
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
      
      // Update company using API
      await companyApi.updateCompany(company.id, formData);
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.navigate('CompanyProfile', { company: { ...company, ...formData } });
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderSectionButton = (section: string, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.sectionButton,
        activeSection === section && { 
          backgroundColor: currentTheme.colors.primary,
          borderColor: currentTheme.colors.primaryBorder
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

  const renderBasicInfoSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Basic Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Company Name</Text>
        <View style={styles.inputContainer}>
          <Icon name="domain" size={20} color={currentTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Enter company name"
            placeholderTextColor={currentTheme.colors.textSecondary}
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Industry</Text>
        <View style={styles.inputContainer}>
          <Icon name="briefcase-outline" size={20} color={currentTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.industry}
            onChangeText={(text) => handleChange('industry', text)}
            placeholder="Enter industry"
            placeholderTextColor={currentTheme.colors.textSecondary}
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Location</Text>
        <View style={styles.inputContainer}>
          <Icon name="map-marker-outline" size={20} color={currentTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.location}
            onChangeText={(text) => handleChange('location', text)}
            placeholder="Enter location"
            placeholderTextColor={currentTheme.colors.textSecondary}
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Description</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            placeholder="Enter company description"
            placeholderTextColor={currentTheme.colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>
    </View>
  );

  const renderContactSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Contact Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Website</Text>
        <View style={styles.inputContainer}>
          <Icon name="web" size={20} color={currentTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.website}
            onChangeText={(text) => handleChange('website', text)}
            placeholder="Enter website URL"
            placeholderTextColor={currentTheme.colors.textSecondary}
            keyboardType="url"
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Code Fiscal</Text>
        <View style={styles.inputContainer}>
          <Icon name="file-document-outline" size={20} color={currentTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.codeFiscal}
            onChangeText={(text) => handleChange('codeFiscal', text)}
            placeholder="Enter code fiscal"
            placeholderTextColor={currentTheme.colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );

  const renderBudgetSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Budget Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Minimum Budget</Text>
        <View style={styles.inputContainer}>
          <Icon name="currency-usd" size={20} color={currentTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.budget.min.toString()}
            onChangeText={(text) => handleChange('budget.min', parseInt(text) || 0)}
            placeholder="Enter minimum budget"
            placeholderTextColor={currentTheme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Maximum Budget</Text>
        <View style={styles.inputContainer}>
          <Icon name="currency-usd" size={20} color={currentTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.budget.max.toString()}
            onChangeText={(text) => handleChange('budget.max', parseInt(text) || 0)}
            placeholder="Enter maximum budget"
            placeholderTextColor={currentTheme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Currency</Text>
        <View style={styles.inputContainer}>
          <Icon name="cash" size={20} color={currentTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.budget.currency}
            onChangeText={(text) => handleChange('budget.currency', text)}
            placeholder="Enter currency (e.g., TND, USD)"
            placeholderTextColor={currentTheme.colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );

  const renderPreferencesSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Collaboration Preferences</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Duration</Text>
        <View style={styles.inputContainer}>
          <Icon name="calendar-range" size={20} color={currentTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.collaborationPreferences.duration}
            onChangeText={(text) => handleChange('collaborationPreferences.duration', text)}
            placeholder="Enter duration (e.g., 3 months)"
            placeholderTextColor={currentTheme.colors.textSecondary}
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.colors.text }]}>Requirements</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }]}
            value={formData.collaborationPreferences.requirements}
            onChangeText={(text) => handleChange('collaborationPreferences.requirements', text)}
            placeholder="Enter collaboration requirements"
            placeholderTextColor={currentTheme.colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={[styles.header, { borderBottomColor: currentTheme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={currentTheme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>Edit Profile</Text>
          <TouchableOpacity 
            style={styles.saveButtonSmall}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={currentTheme.colors.primary} />
            ) : (
              <Icon name="content-save" size={24} color={currentTheme.colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: currentTheme.colors.surface }]}>
            <Icon name="domain" size={40} color={currentTheme.colors.primary} />
          </View>
          <Text style={[styles.companyName, { color: currentTheme.colors.text }]}>
            {formData.name || 'Your Company'}
          </Text>
          <Text style={[styles.companyDetails, { color: currentTheme.colors.textSecondary }]}>
            {formData.industry} • {formData.location}
          </Text>
        </View>
        
        <View style={styles.tabContainer}>
          {renderSectionButton('basic', 'Basic', 'information-outline')}
          {renderSectionButton('contact', 'Contact', 'phone-outline')}
          {renderSectionButton('budget', 'Budget', 'cash-multiple')}
          {renderSectionButton('preferences', 'Preferences', 'tune')}
        </View>
        
        <ScrollView style={styles.formContainer}>
          {activeSection === 'basic' && renderBasicInfoSection()}
          {activeSection === 'contact' && renderContactSection()}
          {activeSection === 'budget' && renderBudgetSection()}
          {activeSection === 'preferences' && renderPreferencesSection()}
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={currentTheme.colors.white} />
            ) : (
              <Text style={[styles.saveButtonText, { color: currentTheme.colors.white }]}>Save Changes</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButtonSmall: {
    padding: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyDetails: {
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
    borderColor: 'transparent',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    borderWidth: 1,
  },
  textAreaContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingLeft: 12,
  },
  saveButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreenWithTheme;