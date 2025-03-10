import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Alert,
  TextInput
} from 'react-native';
import { contractService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomJwtPayload {
  userId: number;
  role: string;
  iat: number;
  exp: number;
}

interface ContractTerm {
  id: number;
  title: string;
  description: string;
  companyAccepted: boolean;
  influencerAccepted: boolean;
}

interface Contract {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'terminated';
  payment_terms: string;
  rank: 'plat' | 'gold' | 'silver' | null;
  createdAt: string;
  updatedAt: string;
}

const SponsorshipTerms = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'company' | 'influencer' | null>(null);
  const [terms, setTerms] = useState<ContractTerm[]>([]);
  const [editingTermId, setEditingTermId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  useEffect(() => {
    fetchUserAndContract();
  }, []);

  // This effect will run when the contract is loaded, ensuring we're ready for step 3
  useEffect(() => {
    if (contract) {
      fetchContractTerms();
    }
  }, [contract]);

  const fetchUserAndContract = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      setUserRole(decodedToken.role as 'company' | 'influencer');

      // Get contracts based on user role
      let contracts;
      if (decodedToken.role === 'company') {
        contracts = await contractService.getContractByCompanyId(decodedToken.userId);
      } else if (decodedToken.role === 'influencer') {
        contracts = await contractService.getContractByContentCreatorId(decodedToken.userId);
      }
      
      if (!contracts || contracts.length === 0) {
        throw new Error('No contracts found');
      }

      // Set the first contract
      setContract(contracts[0]);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchContractTerms = async () => {
    try {
      if (!contract) {
        console.log('No contract available');
        return;
      }
      
      console.log('Fetching terms for contract:', contract.id);
      const contractTerms = await contractService.gettermsbycontractid(contract.id);
      console.log('Received terms:', contractTerms);
      
      if (Array.isArray(contractTerms)) {
        setTerms(contractTerms);
      } else {
        console.error('Terms received is not an array:', contractTerms);
        setTerms([]);
      }
    } catch (err) {
      console.error('Error fetching terms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch terms');
      setTerms([]);
    }
  };

  const handleAccept = async (termId: number) => {
    try {
      if (!contract || !userRole) return;

      const update = {
        [userRole === 'company' ? 'companyAccepted' : 'influencerAccepted']: true
      };

      await contractService.acceptTerm(contract.id, termId, userRole);
      console.log("Term accepted:", termId);
      console.log("User role:", userRole);


      fetchContractTerms();
    } catch (err) {
      Alert.alert('Error', 'Failed to accept term');
    }
  };

  const isTermAccepted = (term: ContractTerm, party: string) => {
    return party === 'company' ? term.companyAccepted : term.influencerAccepted;
  };

  const isTermFullyAccepted = (term: ContractTerm) => {
    return term.companyAccepted && term.influencerAccepted;
  };

  const steps = [1, 2, 3, 4];
  
  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleUpdateTerm = async (termId: number) => {
    try {
      if (!contract) return;

      await contractService.updateTerm(contract.id, termId, {
        title: editedTitle,
        description: editedDescription
      });
      

 
      
      // Reset edit state
      setEditingTermId(null);
      setEditedTitle('');
      setEditedDescription('');
      
      // Immediately update the local state
      setTerms(terms.map(term => {
        if (term.id === termId) {
          return {
            ...term,
            title: editedTitle,
            description: editedDescription
          };
        }
        return term;
      }));

      // Then fetch fresh data
      await fetchContractTerms();
    } catch (error) {
      console.error('Error updating term:', error);
      Alert.alert('Error', 'Failed to update term');
    }
  };
  
  const renderAcceptButtons = (term: ContractTerm) => {
    if (isTermFullyAccepted(term)) {
      return (
        <View style={styles.acceptedContainer}>
          <MaterialIcons name="check-circle" size={20} color="white" />
          <Text style={styles.acceptedText}>Both parties accepted</Text>
        </View>
      );
    }

    return (
      <View style={styles.acceptButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.acceptButton,
            isTermAccepted(term, 'company') && styles.acceptedButton
          ]}
          onPress={() => handleAccept(term.id)}
          disabled={isTermAccepted(term, 'company') || userRole !== 'company'}
        >
          {isTermAccepted(term, 'company') ? (
            <MaterialIcons name="check" size={20} color="white" />
          ) : (
            <MaterialIcons name="business" size={20} color="white" />
          )}
          <Text style={styles.acceptButtonText}>
            {isTermAccepted(term, 'company') ? '✓ Company' : 'Company Accept'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.acceptButton,
            isTermAccepted(term, 'influencer') && styles.acceptedButton
          ]}
          onPress={() => handleAccept(term.id)}
          disabled={isTermAccepted(term, 'influencer') || userRole !== 'influencer'}
        >
          {isTermAccepted(term, 'influencer') ? (
            <MaterialIcons name="check" size={20} color="white" />
          ) : (
            <MaterialIcons name="person" size={20} color="white" />
          )}
          <Text style={styles.acceptButtonText}>
            {isTermAccepted(term, 'influencer') ? '✓ Influencer' : 'Influencer Accept'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderContent = () => {
    switch (currentStep) {
      case 3:
        return (
          <View style={styles.termsList}>
            <Text style={styles.sectionTitle}>Contract Terms</Text>
            {terms.length > 0 ? (
              terms.map((term) => (
                <View key={term.id} style={styles.termItem}>
                  {editingTermId === term.id ? (
                    // Edit Mode
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editedTitle}
                        onChangeText={setEditedTitle}
                        placeholder="Enter title"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        style={[styles.editInput, styles.editTextArea]}
                        value={editedDescription}
                        onChangeText={setEditedDescription}
                        placeholder="Enter description"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={3}
                      />
                      <View style={styles.editButtonsContainer}>
                        <TouchableOpacity
                          style={[styles.editButton, styles.saveButton]}
                          onPress={() => handleUpdateTerm(term.id)}
                        >
                          <Text style={styles.editButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editButton, styles.cancelButton]}
                          onPress={() => setEditingTermId(null)}
                        >
                          <Text style={styles.editButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // View Mode
                    <>
                      <View style={styles.termHeader}>
                        <Text style={styles.termTitle}>{term.title}</Text>
                        <TouchableOpacity
                          style={styles.editIcon}
                          onPress={() => {
                            setEditingTermId(term.id);
                            setEditedTitle(term.title);
                            setEditedDescription(term.description);
                          }}
                        >
                          <Text>⚙️</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.termContent}>
                        <Text style={styles.termDescription}>{term.description}</Text>
                      </View>
                    </>
                  )}
                  
                  {/* Display accept buttons for each term */}
                  {renderAcceptButtons(term)}
                  
                  <View style={styles.acceptanceStatus}>
                    <Text style={styles.statusText}>
                      Company: {term.companyAccepted ? '✓ Accepted' : 'Pending'}
                    </Text>
                    <Text style={styles.statusText}>
                      Influencer: {term.influencerAccepted ? '✓ Accepted' : 'Pending'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noTermsText}>No terms found for this contract</Text>
            )}
          </View>
        );
      default:
        return (
          <View style={styles.termsList}>
            {/* Contract ID */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>Contract ID</Text>
              <View style={styles.termContent}>
                <Text style={styles.termDescription}>{contract?.id}</Text>
              </View>
            </View>

            {/* Title */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>Title</Text>
              <View style={styles.termContent}>
                <Text style={styles.termDescription}>{contract?.title}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>Description</Text>
              <View style={styles.termContent}>
                <Text style={styles.termDescription}>{contract?.description || 'No description'}</Text>
              </View>
            </View>

            {/* Start Date */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>Start Date</Text>
              <View style={styles.termContent}>
                <Text style={styles.termDescription}>
                  {new Date(contract?.start_date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* End Date */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>End Date</Text>
              <View style={styles.termContent}>
                <Text style={styles.termDescription}>
                  {new Date(contract?.end_date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>Status</Text>
              <View style={[styles.termContent, styles[`status${contract?.status}`]]}>
                <Text style={styles.termDescription}>
                  {contract?.status.charAt(0).toUpperCase() + contract?.status.slice(1)}
                </Text>
              </View>
            </View>

            {/* Payment Terms */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>Payment Terms</Text>
              <View style={styles.termContent}>
                <Text style={styles.termDescription}>
                  {contract?.payment_terms || 'No payment terms specified'}
                </Text>
              </View>
            </View>

            {/* Rank */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>Rank</Text>
              <View style={[styles.termContent, styles[`rank${contract?.rank}`]]}>
                <Text style={styles.termDescription}>
                  {contract?.rank ? contract?.rank.toUpperCase() : 'No rank assigned'}
                </Text>
              </View>
            </View>

            {/* Created At */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>Created</Text>
              <View style={styles.termContent}>
                <Text style={styles.termDescription}>
                  {new Date(contract?.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Updated At */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>Last Updated</Text>
              <View style={styles.termContent}>
                <Text style={styles.termDescription}>
                  {new Date(contract?.updatedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contract Details</Text>
        <View style={styles.headerIcons} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <View 
                  style={[
                    styles.stepCircle, 
                    step <= currentStep ? styles.activeStep : styles.inactiveStep
                  ]}
                >
                  <Text style={styles.stepText}>{step}</Text>
                </View>
                
                {index < steps.length - 1 && (
                  <View 
                    style={[
                      styles.connector, 
                      step < currentStep ? styles.activeConnector : styles.inactiveConnector
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
        
        {/* Dynamic Content Section */}
        <View style={styles.termsContainer}>
          {loading ? (
            <Text style={{ color: 'white' }}>Loading...</Text>
          ) : error ? (
            <Text style={{ color: 'red' }}>{error}</Text>
          ) : contract ? (
            renderContent()
          ) : (
            <Text style={{ color: 'white' }}>No contract found</Text>
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueButton}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    fontSize: 20,
    marginLeft: 16,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#111827',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeStep: {
    backgroundColor: '#9333EA', // purple-600 equivalent
  },
  inactiveStep: {
    backgroundColor: '#374151', // gray-700 equivalent
  },
  stepText: {
    color: 'white',
    fontWeight: '600',
  },
  connector: {
    flex: 1,
    height: 4,
    marginHorizontal: 4,
  },
  activeConnector: {
    backgroundColor: '#9333EA', // purple-600 equivalent
  },
  inactiveConnector: {
    backgroundColor: '#374151', // gray-700 equivalent
  },
  termsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 90, // Add extra padding at bottom to account for fixed button
  },
  termsTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  termsList: {
    gap: 16,
  },
  termItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  termTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  termContent: {
    backgroundColor: '#1F2937', // gray-800 equivalent
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  termDescription: {
    color: 'white',
  },
  editIcon: {
    backgroundColor: '#374151',
    padding: 8,
    borderRadius: 20,
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: '#000000', // Match container background
  },
  continueButton: {
    backgroundColor: '#9333EA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  acceptButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acceptedButton: {
    backgroundColor: '#059669',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  acceptedContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#059669',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acceptedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: 32,
  },
  // Status styles
  statusactive: {
    borderLeftColor: '#10B981', // green
    borderLeftWidth: 4,
  },
  statuscompleted: {
    borderLeftColor: '#6366F1', // indigo
    borderLeftWidth: 4,
  },
  statusterminated: {
    borderLeftColor: '#EF4444', // red
    borderLeftWidth: 4,
  },

  // Rank styles
  rankplat: {
    borderLeftColor: '#818CF8', // indigo-400
    borderLeftWidth: 4,
  },
  rankgold: {
    borderLeftColor: '#FCD34D', // yellow-400
    borderLeftWidth: 4,
  },
  ranksilver: {
    borderLeftColor: '#9CA3AF', // gray-400
    borderLeftWidth: 4,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  acceptanceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  statusText: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  noTermsText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editContainer: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
  },
  editInput: {
    backgroundColor: '#4B5563',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  editTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#059669',
  },
  cancelButton: {
    backgroundColor: '#4B5563',
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SponsorshipTerms;