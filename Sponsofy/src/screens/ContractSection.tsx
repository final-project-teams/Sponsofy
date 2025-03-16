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
import { useSocket } from '../context/socketContext'; // Import the useSocket hook

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
  status: string;
  importance: 'critical' | 'important' | 'standard';
  negotiation?: {
    status: 'pending' | 'completed';
    confirmation_company: boolean;
    confirmation_Influencer: boolean;
  };
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
  const [showPreview, setShowPreview] = useState(false);

  // Use the contractSocket from the useSocket hook
  const { contractSocket } = useSocket();

  useEffect(() => {
    fetchUserAndContract();

    // Only set up socket listeners if contractSocket exists
    if (contractSocket) {
      // Listen for socket events
      contractSocket.on('termUpdated', handleTermUpdated);
      contractSocket.on('termAccepted', handleTermAccepted);

      // Cleanup on unmount
      return () => {
        contractSocket.off('termUpdated', handleTermUpdated);
        contractSocket.off('termAccepted', handleTermAccepted);
      };
    }
  }, [contractSocket]); // Add contractSocket as a dependency

  const fetchUserAndContract = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      console.log('User info:', decodedToken);
  
      let contracts;
      if (decodedToken.role === 'company') {
        contracts = await contractService.getContractByCompanyId(decodedToken.userId);
        setUserRole('company');
      } else if (decodedToken.role === 'content_creator') {
        contracts = await contractService.getContractByContentCreatorId(decodedToken.userId);
        setUserRole('influencer');
      } else {
        throw new Error(`Invalid role: ${decodedToken.role}`);
      }
  
      if (contracts?.length > 0) {
        setContract(contracts[0]);
        // Fetch terms immediately after setting contract
        const contractTerms = await contractService.gettermsbycontractid(contracts[0].id);
        if (Array.isArray(contractTerms)) {
          // Load acceptance status from AsyncStorage
          const updatedTerms = await Promise.all(contractTerms.map(async (term) => {
            const isAccepted = await AsyncStorage.getItem(`term_${term.id}_accepted`);
            if (isAccepted === 'true') {
              return {
                ...term,
                negotiation: {
                  ...term.negotiation,
                  confirmation_company: userRole === 'company' ? true : term.negotiation?.confirmation_company,
                  confirmation_Influencer: userRole === 'influencer' ? true : term.negotiation?.confirmation_Influencer,
                }
              };
            }
            return term;
          }));
          setTerms(updatedTerms);
        }
      }
  
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (termId: number) => {
    try {
      if (!contract || !userRole || !contractSocket) return;
  
      const response = await contractService.acceptTerm(contract.id, termId, userRole);
      console.log("Accept response:", response);
  
      if (response.success) {
        // Update local state immediately
        setTerms(prevTerms => prevTerms.map(term => 
          term.id === termId 
            ? {
                ...term,
                status: response.negotiation.status,
                negotiation: response.negotiation
              }
            : term
        ));
  
        // Save acceptance status to AsyncStorage
        await AsyncStorage.setItem(`term_${termId}_accepted`, 'true');

        // Emit socket event using contractSocket
        contractSocket.emit('termAccepted', { termId, userRole });
      }
  
    } catch (err) {
      console.error('Accept error:', err);
      Alert.alert('Error', 'Failed to accept term');
    }
  };

  const handleTermUpdated = (updatedTerm: ContractTerm) => {
    setTerms(prevTerms => prevTerms.map(term => 
      term.id === updatedTerm.id ? updatedTerm : term
    ));
  };

  const handleTermAccepted = ({ termId, userRole }: { termId: number, userRole: string }) => {
    setTerms(prevTerms => prevTerms.map(term => 
      term.id === termId 
        ? {
            ...term,
            negotiation: {
              ...term.negotiation,
              [userRole === 'company' ? 'confirmation_company' : 'confirmation_Influencer']: true
            }
          }
        : term
    ));
  };

  const isTermAccepted = (term: ContractTerm, party: string) => {
    return party === 'company' ? term.negotiation?.confirmation_company : term.negotiation?.confirmation_Influencer;
  };

  const isTermFullyAccepted = (term: ContractTerm) => {
    return term.negotiation?.confirmation_company && term.negotiation?.confirmation_Influencer;
  };

  const steps = [1, 2, 3, 4];
  
  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleUpdateTerm = async (termId: number) => {
    try {
      if (!contract || !contractSocket) {
        throw new Error('No contract found or socket not connected');
      }

      const updates = {
        title: editedTitle,
        description: editedDescription
      };

      console.log('Attempting to update term:', { termId, updates });

      const response = await contractService.updateTerm(contract.id, termId, updates);

      if (response.success && response.term) {
        // Update the local state with the server response
        setTerms(prevTerms => prevTerms.map(term => 
          term.id === termId ? response.term : term
        ));

        // Reset edit state
        setEditingTermId(null);
        setEditedTitle('');
        setEditedDescription('');

        console.log('Term updated successfully');

        // Emit socket event using contractSocket
        contractSocket.emit('termUpdated', response.term);
      } else {
        throw new Error('Failed to update term');
      }

    } catch (error) {
      console.error('Error updating term:', error);
      Alert.alert(
        'Error',
        'Failed to update term. Please try again.'
      );
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical':
        return { icon: '🔴', label: 'Critical' };
      case 'important':
        return { icon: '🔴', label: 'Important' };
      case 'standard':
        return { icon: '🔴', label: 'Standard' };
      default :
        return { icon: '🔴', label: 'Standard' };
    }
  };

  const renderAcceptButtons = (term: ContractTerm) => {
    const negotiation = term.negotiation;
    return (
      <View style={styles.acceptButtonsContainer}>
        <View style={[
          styles.acceptButton,
          negotiation?.confirmation_company && styles.acceptedButton
        ]}>
          <MaterialIcons 
            name={negotiation?.confirmation_company ? "check" : "business"} 
            size={20} 
            color={negotiation?.confirmation_company ? "#10B981" : "white"} 
          />
          <Text style={styles.acceptButtonText}>
            Company: {negotiation?.confirmation_company ? '✓ Accepted' : 'Pending'}
          </Text>
        </View>
  
        <View style={[
          styles.acceptButton,
          negotiation?.confirmation_Influencer && styles.acceptedButton
        ]}>
          <MaterialIcons 
            name={negotiation?.confirmation_Influencer ? "check" : "person"} 
            size={20} 
            color={negotiation?.confirmation_Influencer ? "#10B981" : "white"} 
          />
          <Text style={styles.acceptButtonText}>
            Influencer: {negotiation?.confirmation_Influencer ? '✓ Accepted' : 'Pending'}
          </Text>
        </View>
  
        {userRole && !negotiation?.[userRole === 'company' ? 'confirmation_company' : 'confirmation_Influencer'] && (
          <TouchableOpacity
            style={styles.acceptActionButton}
            onPress={() => handleAccept(term.id)}
          >
            <Text style={styles.acceptButtonText}>Accept Term</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPreviewButton = () => {
    if (currentStep === 3) {
      return (
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() => setShowPreview(!showPreview)}
        >
          <MaterialIcons 
            name={showPreview ? "visibility-off" : "visibility"} 
            size={20} 
            color="white" 
          />
          <Text style={styles.previewButtonText}>
            {showPreview ? 'Hide Preview' : 'Show All Terms'}
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderContent = () => {
    // Check if all terms are accepted at the start of renderContent
    const allTermsAccepted = areAllTermsAccepted();

    switch (currentStep) {
     case 3:
  return (
    <View style={styles.termsList}>
      <Text style={styles.sectionTitle}>Contract Terms</Text>
      {allTermsAccepted ? (
        <View style={styles.lockedContainer}>
          <MaterialIcons name="lock" size={48} color="#10B981" />
          <Text style={styles.lockedText}>All Terms Accepted</Text>
          <Text style={styles.lockedSubText}>
            You can now proceed to complete the contract
          </Text>
        </View>
      ) : (
        terms.length > 0 ? (
          <>
            {showPreview ? (
              <View style={styles.previewContainer}>
                {terms.map((term, index) => (
                  <View key={term.id} style={styles.previewItem}>
                    <Text style={styles.previewIndex}>{index + 1}.</Text>
                    <View style={styles.previewContent}>
                      <View style={styles.previewHeader}>
                        <Text style={styles.previewTitle}>{term.title}</Text>
                        <View style={styles.importanceBadge}>
                          <Text>{getImportanceIcon(term.importance).icon}</Text>
                          <Text style={styles.importanceLabel}>
                            {getImportanceIcon(term.importance).label}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.previewDescription}>{term.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
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
                        <View style={styles.termHeaderLeft}>
                          <Text style={styles.termTitle}>{term.title}</Text>
                          <View style={styles.importanceBadge}>
                            <Text>{getImportanceIcon(term.importance).icon}</Text>
                            <Text style={styles.importanceLabel}>
                              {getImportanceIcon(term.importance).label}
                            </Text>
                          </View>
                        </View>
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
                </View>
              ))
            )}
            {renderPreviewButton()}
          </>
        ) : (
          <Text style={styles.noTermsText}>No terms found for this contract</Text>
        )
      )}
    </View>
  );
   case 4:
  return (
    <View style={styles.termsList}>
      <Text style={styles.sectionTitle}>Payment Terms</Text>
      {allTermsAccepted ? (
        <View style={styles.lockedContainer}>
          <MaterialIcons name="lock" size={48} color="#10B981" />
          <Text style={styles.lockedText}>Payment Terms Locked</Text>
          <Text style={styles.lockedSubText}>
            All terms have been accepted by both parties
          </Text>
        </View>
      ) : (
        terms.length > 0 ? (
          terms.map((term) => (
            <View key={term.id} style={styles.termItem}>
              <View style={styles.termHeader}>
                <View style={styles.termHeaderLeft}>
                  <Text style={styles.termTitle}>{term.title}</Text>
                  <View style={styles.importanceBadge}>
                    <Text>{getImportanceIcon(term.importance).icon}</Text>
                    <Text style={styles.importanceLabel}>
                      {getImportanceIcon(term.importance).label}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.termContent}>
                <Text style={styles.termDescription}>{term.description}</Text>
              </View>
              {/* Display accept buttons for each term */}
              {renderAcceptButtons(term)}
            </View>
          ))
        ) : (
          <Text style={styles.noTermsText}>No terms found for this contract</Text>
        )
      )}
    </View>
  );
      default:
        return (
          <View style={styles.termsList}>
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
                  {new Date(contract?.start_date || '').toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* End Date */}
            <View style={styles.termItem}>
              <Text style={styles.termTitle}>End Date</Text>
              <View style={styles.termContent}>
                <Text style={styles.termDescription}>
                  {new Date(contract?.end_date || '').toLocaleDateString()}
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

  const stepLabels = ['Contract', 'Review', 'Terms', 'Payment'];

  const areAllTermsAccepted = () => {
    return terms.every(term => 
      term.negotiation?.confirmation_company && 
      term.negotiation?.confirmation_Influencer
    );
  };

  const handleContractCompletion = async () => {
    try {
      if (!contract) return;
      
      const response = await contractService.updateContractStatus(contract.id, 'completed');
      if (response.success) {
        setContract({ ...contract, status: 'completed' });
        Alert.alert('Success', 'Contract has been completed');
      }
    } catch (error) {
      console.error('Error completing contract:', error);
      Alert.alert('Error', 'Failed to complete contract');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contract Details</Text>
        <View style={styles.headerIcons}>
          {areAllTermsAccepted() && (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={handleContractCompletion}
            >
              <MaterialIcons name="check-circle" size={24} color="#10B981" />
              <Text style={styles.completeButtonText}>Complete Contract</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <View style={{ alignItems: 'center' }}>
                  <View 
                    style={[
                      styles.stepCircle,
                      step < currentStep && styles.completedStep,
                      step === currentStep && styles.activeStep,
                    ]}
                  >
                    {step < currentStep ? (
                      <MaterialIcons name="check" size={24} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepText}>{step}</Text>
                    )}
                  </View>
                  <Text 
                    style={[
                      styles.stepLabel,
                      step === currentStep && styles.activeLabel,
                      step < currentStep && styles.completedLabel,
                    ]}
                  >
                    {stepLabels[index]}
                  </Text>
                </View>
                
                {index < steps.length - 1 && (
                  <View 
                    style={[
                      styles.connector,
                      step < currentStep && styles.completedConnector,
                      step === currentStep && styles.activeConnector,
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
            contract?.status === 'completed' ? (
              <View style={styles.completedBanner}>
                <MaterialIcons name="lock" size={24} color="#10B981" />
                <Text style={styles.completedText}>Contract Completed</Text>
              </View>
            ) : (
              renderContent()
            )
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
    backgroundColor: '#0A0A0A', // Darker background for better contrast
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    paddingVertical: 24,
    backgroundColor: '#111111',
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    paddingVertical: 8,
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D2D2D',
    borderWidth: 3,
    borderColor: '#3D3D3D',
    zIndex: 2,
  },
  activeStep: {
    backgroundColor: '#8B5CF6',
    borderColor: '#A78BFA',
    transform: [{ scale: 1.1 }],
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  completedStep: {
    backgroundColor: '#059669',
    borderColor: '#34D399',
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepLabel: {
    position: 'absolute',
    top: 52,
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    width: 80,
    textAlign: 'center',
    marginLeft: -20,
  },
  activeLabel: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  completedLabel: {
    color: '#34D399',
  },
  connector: {
    height: 3,
    flex: 1,
    marginHorizontal: -4,
    backgroundColor: '#2D2D2D',
    zIndex: 1,
  },
  activeConnector: {
    backgroundColor: '#8B5CF6',
  },
  completedConnector: {
    backgroundColor: '#059669',
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
    backgroundColor: '#171717',
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#222222',
  },
  termTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  termContent: {
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  termDescription: {
    color: '#E5E5E5',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  editIcon: {
    backgroundColor: '#2D2D2D',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: '#000000', // Match container background
  },
  continueButton: {
    backgroundColor: '#8B5CF6',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  acceptButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    paddingHorizontal: 4,
    letterSpacing: 0.5,
  },
  acceptanceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  statusText: {
    color: '#E5E5E5',
    fontSize: 14,
    fontWeight: '500',
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
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D2D2D',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  previewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  previewContainer: {
    backgroundColor: '#171717',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  previewItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  previewIndex: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
    width: 30,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewDescription: {
    color: '#E5E5E5',
    fontSize: 14,
    lineHeight: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  termHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  importanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  importanceLabel: {
    color: '#E5E5E5',
    fontSize: 12,
    fontWeight: '500',
  },
  acceptActionButton: {
    backgroundColor: '#8B5CF6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064E3B',
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  completedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  lockedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    padding: 32,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  lockedText: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  lockedSubText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SponsorshipTerms;