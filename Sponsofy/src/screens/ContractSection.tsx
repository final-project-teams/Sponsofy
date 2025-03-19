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
  TextInput,
  Image,
  Modal
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

interface TermHistory {
  id: number;
  termId: number;
  previousTitle: string;
  previousDescription: string;
  updatedBy: string;
  timestamp: Date;
}

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  paymentMethod: string;
  onSubmit: (paymentDetails: PaymentDetails) => void;
}

interface PaymentDetails {
  accountNumber?: string;
  routingNumber?: string;
  amount?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  email?: string;
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
  const [termHistory, setTermHistory] = useState<Record<number, TermHistory[]>>({});
  const [showHistory, setShowHistory] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});

  // Use the contractSocket from the useSocket hook
  const { contractSocket} = useSocket();


  useEffect(() => {
    fetchUserAndContract();

    // Only set up socket listeners if contractSocket exists
    if (contractSocket) {
      // Join the contract room when component mounts
      if (contract?.id) {
        contractSocket.emit('join_contract_room', contract.id);
      }

      // Listen for socket events
      contractSocket.on('term_status_changed', handleTermStatusChanged);
      contractSocket.on('term_content_changed', handleTermContentChanged);
      contractSocket.on('contract_status_changed', handleContractStatusChanged);

      // Cleanup on unmount
      return () => {
        if (contract?.id) {
          contractSocket.emit('unsubscribe', contract.id);
        }
        contractSocket.off('term_status_changed', handleTermStatusChanged);
        contractSocket.off('term_content_changed', handleTermContentChanged);
        contractSocket.off('contract_status_changed', handleContractStatusChanged);
      };
    }
  }, [contractSocket, contract?.id]);

  const fetchUserAndContract = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      // console.log('User info:', decodedToken);
  
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

  const handleTermStatusChanged = (data: {
    termId: number;
    acceptedBy: string;
    confirmationField: string;
    action: string;
    timestamp: Date;
  }) => {
    setTerms(prevTerms => prevTerms.map(term => 
      term.id === data.termId 
        ? {
            ...term,
            negotiation: {
              ...term.negotiation,
              [data.confirmationField]: true,
              status: term.negotiation?.confirmation_company && term.negotiation?.confirmation_Influencer 
                ? 'completed' 
                : 'pending'
            }
          }
        : term
    ));
  };

  const handleTermContentChanged = (data: {
    termId: number;
    updates: { title?: string; description?: string };
    updatedBy: string;
    timestamp: Date;
  }) => {
    setTerms(prevTerms => prevTerms.map(term =>
      term.id === data.termId
        ? { ...term, ...data.updates }
        : term
    ));
  };

  const handleContractStatusChanged = (data: {
    status: string;
    confirmedBy: string;
    timestamp: Date;
  }) => {
    if (contract) {
      setContract({ ...contract, status: data.status as Contract['status'] });
    }
  };

  const handleAccept = async (termId: number) => {
    try {
      if (!contract || !userRole || !contractSocket) return;

      const confirmationField = userRole === 'company' ? 'confirmation_company' : 'confirmation_Influencer';
      
      const response = await contractService.acceptTerm(contract.id, termId, userRole);

      if (response.success) {
        // Update local state first
        setTerms(prevTerms => prevTerms.map(term => 
          term.id === termId
            ? {
                ...term,
                negotiation: {
                  ...term.negotiation,
                  [confirmationField]: true,
                  status: 'pending'
                }
              }
            : term
        ));

        // Then emit socket event
        contractSocket.emit('term_accepted', {
          contractId: contract.id,
          termId,
          role: userRole,
          confirmationField,
          userId: (jwtDecode<CustomJwtPayload>(await AsyncStorage.getItem('userToken') || '')).userId
        });
      }
    } catch (err) {
      console.error('Accept error:', err);
      Alert.alert('Error', 'Failed to accept term');
    }
  };

  const handleUpdateTerm = async (termId: number) => {
    try {
      if (!contract) return;

      const currentTerm = terms.find(t => t.id === termId);
      if (!currentTerm) return;

      const updates = {
        title: editedTitle,
        description: editedDescription
      };

      const response = await contractService.updateTerm(contract.id, termId, updates);

      if (response.success && response.term) {
        // Save the history
        setTermHistory(prev => ({
          ...prev,
          [termId]: [
            {
              id: Date.now(),
              termId,
              previousTitle: currentTerm.title,
              previousDescription: currentTerm.description,
              updatedBy: userRole || 'unknown',
              timestamp: new Date()
            },
            ...(prev[termId] || [])
          ]
        }));

        // Update the term
        setTerms(prevTerms => prevTerms.map(term => 
          term.id === termId ? response.term : term
        ));

        setEditingTermId(null);
        setEditedTitle('');
        setEditedDescription('');
      }
    } catch (error) {
      console.error('Error updating term:', error);
      Alert.alert('Error', 'Failed to update term. Please try again.');
    }
  };

  const handleContractCompletion = async () => {
    try {
      if (!contract || !contractSocket) return;
      
      const response = await contractService.updateContractStatus(contract.id, 'completed');
      if (response.success) {
        setContract({ ...contract, status: 'completed' });
        
        // Emit socket event for contract confirmation
        contractSocket.emit('contract_confirmed', {
          contractId: contract.id,
          confirmedBy: userRole
        });
        
        Alert.alert('Success', 'Contract has been completed');
      }
    } catch (error) {
      console.error('Error completing contract:', error);
      Alert.alert('Error', 'Failed to complete contract');
    }
  };

  const handleProcessPayment = (paymentDetails: PaymentDetails) => {
    try {
      // Here you would integrate with your payment processing API
      Alert.alert(
        'Processing Payment',
        'Please wait while we process your payment...',
        [
          {
            text: 'OK',
            onPress: () => {
              // Simulate successful payment
              Alert.alert(
                'Payment Successful',
                'Your payment has been processed successfully!',
                [
                  {
                    text: 'Continue',
                    onPress: () => {
                      setShowPaymentModal(false);
                      setCurrentStep(currentStep + 1);
                      handleContractCompletion();
                    }
                  }
                ]
              );
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    }
  };

  const isTermAccepted = (term: ContractTerm, party: string) => {
    return party === 'company' ? term.negotiation?.confirmation_company : term.negotiation?.confirmation_Influencer;
  };

  const isTermFullyAccepted = (term: ContractTerm) => {
    return term.negotiation?.confirmation_company && term.negotiation?.confirmation_Influencer;
  };

  const steps = [1, 2, 3, 4, 5];
  
  const handleContinue = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
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
        
         
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderTermHistory = (termId: number) => {
    const history = termHistory[termId] || [];
    
    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Change History</Text>
          <TouchableOpacity 
            style={styles.closeHistoryButton}
            onPress={() => setShowHistory(null)}
          >
            <MaterialIcons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        
        {history.length > 0 ? (
          <ScrollView style={styles.historyList}>
            {history.map((change, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyItemHeader}>
                  <Text style={styles.historyTimestamp}>
                    {new Date(change.timestamp).toLocaleString()}
                  </Text>
                  <Text style={styles.historyUpdatedBy}>
                    Updated by {change.updatedBy}
                  </Text>
                </View>
                
                <View style={styles.historyContent}>
                  <View style={styles.historyField}>
                    <Text style={styles.historyLabel}>Previous Title:</Text>
                    <Text style={styles.historyValue}>{change.previousTitle}</Text>
                  </View>
                  
                  <View style={styles.historyField}>
                    <Text style={styles.historyLabel}>Previous Description:</Text>
                    <Text style={styles.historyValue}>{change.previousDescription}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noHistoryText}>No changes recorded yet</Text>
        )}
      </View>
    );
  };

  const renderTermCard = (term: ContractTerm) => {
   
    
    return (
      <View style={styles.termCard}>
        <View style={styles.termCardHeader}>
          <View style={styles.termCardHeaderLeft}>
            <Text style={styles.termCardTitle}>{term.title}</Text>
            <View style={[styles.importanceBadge, styles[`importance${term.importance}`]]}>
             
            </View>
          </View>
          <View style={styles.termCardActions}>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => setShowHistory(term.id)}
            >
              <MaterialIcons name="history" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setEditingTermId(term.id);
                setEditedTitle(term.title);
                setEditedDescription(term.description);
              }}
            >
              <MaterialIcons name="edit" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {showHistory === term.id && renderTermHistory(term.id)}
        
        <View style={styles.termCardContent}>
          <Text style={styles.termCardDescription}>{term.description}</Text>
        </View>
        
        <View style={styles.termCardFooter}>
          {renderAcceptButtons(term)}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    // Check if all terms are accepted at the start of renderContent
    const allTermsAccepted = areAllTermsAccepted();

    switch (currentStep) {
      // Payment step case
      case 5:
        return (
          <View style={styles.paymentContainer}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            
            <View style={styles.paymentMethodsContainer}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'credit_card' && styles.selectedPaymentMethod
                ]}
                onPress={() => {
                  setSelectedPaymentMethod('credit_card');
                  setShowPaymentModal(true);
                }}
              >
                <MaterialIcons 
                  name="credit-card" 
                  size={32} 
                  color={selectedPaymentMethod === 'credit_card' ? "#10B981" : "#9CA3AF"} 
                />
                <Text style={styles.paymentMethodText}>Credit Card</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'paypal' && styles.selectedPaymentMethod
                ]}
                onPress={() => {
                  setSelectedPaymentMethod('paypal');
                  setShowPaymentModal(true);
                }}
              >
                <MaterialIcons 
                  name="account-balance-wallet" 
                  size={32} 
                  color={selectedPaymentMethod === 'paypal' ? "#10B981" : "#9CA3AF"} 
                />
                <Text style={styles.paymentMethodText}>PayPal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'bank_transfer' && styles.selectedPaymentMethod
                ]}
                onPress={() => {
                  setSelectedPaymentMethod('bank_transfer');
                  setShowPaymentModal(true);
                }}
              >
                <MaterialIcons 
                  name="account-balance" 
                  size={32} 
                  color={selectedPaymentMethod === 'bank_transfer' ? "#10B981" : "#9CA3AF"} 
                />
                <Text style={styles.paymentMethodText}>Bank Transfer</Text>
              </TouchableOpacity>
            </View>

            <PaymentModal
              visible={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              paymentMethod={selectedPaymentMethod || ''}
              onSubmit={handleProcessPayment}
            />
          </View>
        );
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
                          <Text style={styles.importanceLabel}>
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
                            <Text style={styles.importanceLabel}>
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
      <Text style={styles.sectionTitle}>Confirm Terms</Text>
      {allTermsAccepted ? (
        <View style={styles.lockedContainer}>
          <MaterialIcons name="lock" size={48} color="#10B981" />
          <Text style={styles.lockedText}>Terms Locked</Text>
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
                    <Text style={styles.importanceLabel}>
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

  const stepLabels = ['Contract', 'Review', 'Terms', 'Confirm', 'Payment'];

  const areAllTermsAccepted = () => {
    return terms.every(term => 
      term.negotiation?.confirmation_company && 
      term.negotiation?.confirmation_Influencer
    );
  };

  const PaymentModal = ({ visible, onClose, paymentMethod, onSubmit }: PaymentModalProps) => {
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});

    const handleConfirm = () => {
      // Validate based on payment method
      if (paymentMethod === 'credit_card') {
        if (!paymentDetails.cardNumber || !paymentDetails.cardHolder || 
            !paymentDetails.expiryDate || !paymentDetails.cvv) {
          Alert.alert('Error', 'Please fill in all card details');
          return;
        }
      } else if (paymentMethod === 'bank_transfer') {
        if (!paymentDetails.accountNumber || !paymentDetails.routingNumber) {
          Alert.alert('Error', 'Please fill in all bank details');
          return;
        }
      } else if (paymentMethod === 'paypal') {
        if (!paymentDetails.email) {
          Alert.alert('Error', 'Please enter PayPal email');
          return;
        }
      }

      onSubmit(paymentDetails);
    };

    const renderPaymentForm = () => {
      switch (paymentMethod) {
        case 'credit_card':
          return (
            <View style={styles.paymentForm}>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={paymentDetails.cardNumber}
                onChangeText={(text) => setPaymentDetails({...paymentDetails, cardNumber: text})}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                value={paymentDetails.cardHolder}
                onChangeText={(text) => setPaymentDetails({...paymentDetails, cardHolder: text})}
                placeholderTextColor="#9CA3AF"
              />
              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChangeText={(text) => setPaymentDetails({...paymentDetails, expiryDate: text})}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="CVV"
                  value={paymentDetails.cvv}
                  onChangeText={(text) => setPaymentDetails({...paymentDetails, cvv: text})}
                  keyboardType="numeric"
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          );

        case 'bank_transfer':
          return (
            <View style={styles.paymentForm}>
              <TextInput
                style={styles.input}
                placeholder="Account Number"
                value={paymentDetails.accountNumber}
                onChangeText={(text) => setPaymentDetails({...paymentDetails, accountNumber: text})}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={styles.input}
                placeholder="Routing Number"
                value={paymentDetails.routingNumber}
                onChangeText={(text) => setPaymentDetails({...paymentDetails, routingNumber: text})}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          );

        case 'paypal':
          return (
            <View style={styles.paymentForm}>
              <TextInput
                style={styles.input}
                placeholder="PayPal Email"
                value={paymentDetails.email}
                onChangeText={(text) => setPaymentDetails({...paymentDetails, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          );

        default:
          return null;
      }
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Payment</Text>
            
            {renderPaymentForm()}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleConfirm}
              >
                <MaterialIcons name="lock" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Confirm Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contract Details</Text>
        <View style={styles.headerActions}>
          {currentStep === 3 && ( // Only show for step 3
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
                {showPreview ? 'Hide Terms' : 'Show All Terms'}
              </Text>
            </TouchableOpacity>
          )}
          {areAllTermsAccepted() && currentStep !== 5 && (
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
                <View style={styles.stepWrapper}>
                  <View 
                    style={[
                      styles.stepCircle,
                      step < currentStep && styles.completedStep,
                      step === currentStep && styles.activeStep,
                    ]}
                  >
                    {step < currentStep ? (
                      <MaterialIcons name="check" size={20} color="#FFFFFF" />
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
    backgroundColor: '#0A0A0A',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065F46',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#171717',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3D3D3D',
    zIndex: 1,
  },
  activeStep: {
    backgroundColor: '#7C3AED',
    borderColor: '#8B5CF6',
    transform: [{ scale: 1.1 }],
  },
  completedStep: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
    width: 64,
  },
  activeLabel: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  completedLabel: {
    color: '#10B981',
  },
  connector: {
    height: 2,
    flex: 1,
    backgroundColor: '#2D2D2D',
    marginHorizontal: -2,
    zIndex: 0,
  },
  activeConnector: {
    backgroundColor: '#7C3AED',
  },
  completedConnector: {
    backgroundColor: '#059669',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  termsContainer: {
    padding: 20,
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  termHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  termTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
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
    marginTop: 20,
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  acceptedButton: {
    backgroundColor: '#065F46',
    borderColor: '#059669',
    borderWidth: 1,
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
    height: 40,
  },
  // Status styles
  statusactive: {
    borderLeftColor: '#10B981',
    borderLeftWidth: 4,
  },
  statuscompleted: {
    borderLeftColor: '#8B5CF6',
    borderLeftWidth: 4,
  },
  statusterminated: {
    borderLeftColor: '#EF4444',
    borderLeftWidth: 4,
  },

  // Rank styles
  rankplat: {
    borderLeftColor: '#8B5CF6',
    borderLeftWidth: 4,
  },
  rankgold: {
    borderLeftColor: '#F59E0B',
    borderLeftWidth: 4,
  },
  ranksilver: {
    borderLeftColor: '#9CA3AF',
    borderLeftWidth: 4,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    marginHorizontal: 20,
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
  importanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  importanceLabel: {
    color: '#E5E5E5',
    fontSize: 13,
    fontWeight: '600',
  },
  acceptActionButton: {
    backgroundColor: '#7C3AED',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
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
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
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
  sectionDivider: {
    height: 1,
    backgroundColor: '#2D2D2D',
    marginVertical: 24,
    marginHorizontal: 20,
  },
  historyContainer: {
    backgroundColor: '#202020',
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeHistoryButton: {
    padding: 8,
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyTimestamp: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  historyUpdatedBy: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '500',
  },
  historyContent: {
    gap: 12,
  },
  historyField: {
    gap: 4,
  },
  historyLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  historyValue: {
    color: '#E5E5E5',
    fontSize: 14,
    lineHeight: 20,
  },
  noHistoryText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
  },
  termCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  historyButton: {
    backgroundColor: '#2D2D2D',
    padding: 10,
    borderRadius: 12,
  },
  termCard: {
    backgroundColor: '#171717',
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  termCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  termCardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  termCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  termCardContent: {
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  termCardDescription: {
    color: '#E5E5E5',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  termCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  paymentContainer: {
    flex: 1,
    padding: 20,
  },
  paymentSection: {
    backgroundColor: '#171717',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  paymentLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    padding: 12,
  },
  currencySymbol: {
    color: '#9CA3AF',
    fontSize: 20,
    marginRight: 8,
  },
  paymentInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    padding: 0,
  },
  paymentMethodTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 24,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: '#171717',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D2D2D',
  },
  selectedPaymentMethod: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  paymentMethodText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  processPaymentButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#374151',
    opacity: 0.7,
  },
  processPaymentText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#171717',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  paymentInfoText: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#171717',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  paymentForm: {
    gap: 16,
    marginVertical: 20,
  },
  input: {
    height: 50,
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

});

export default SponsorshipTerms;