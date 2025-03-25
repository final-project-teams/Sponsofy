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
  Modal,
  ActivityIndicator
} from 'react-native';
import { contractService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { MaterialIcons } from '@expo/vector-icons';
import { useSocket } from '../context/socketContext'; // Import the useSocket hook
import { paymentService } from '../services/api';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useNavigation } from '@react-navigation/native';

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

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: 'credit-card' | 'payment' | 'account-balance';
  isAvailable: boolean;
  comingSoon?: boolean;
}

// Add this helper function after the imports
const formatAmount = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(numAmount);
};

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
  const [email, setEmail] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const navigation = useNavigation();

  // Use the contractSocket from the useSocket hook
  const { contractSocket} = useSocket();

  // Add this check for Stripe availability
  const stripe = useStripe();
  const [stripeReady, setStripeReady] = useState(false);

  // Add this useEffect to check Stripe initialization
  useEffect(() => {
    if (stripe) {
      setStripeReady(true);
    }
  }, [stripe]);

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

  const isTermAccepted = (term: ContractTerm, party: string) => {
    return party === 'company' ? term.negotiation?.confirmation_company : term.negotiation?.confirmation_Influencer;
  };

  const isTermFullyAccepted = (term: ContractTerm) => {
    return term.negotiation?.confirmation_company && term.negotiation?.confirmation_Influencer;
  };

  const steps = [1, 2, 3, 4, 5];
  
  const handleContinue = () => {
    if (currentStep === 5) {
      // Don't proceed beyond payment step
      return;
    }
    
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

  const PaymentIntent = async () => {
    try {
      const amount = Number(1000); // Default to 1000 if payment_terms is invalid
      
      const response = await paymentService.createEscrowPayment({
        contractId: contract!.id,
        amount: 1000,
        userId: (jwtDecode<CustomJwtPayload>(await AsyncStorage.getItem('userToken') || '')).userId,
        currency: 'usd',
        escrowHoldPeriod: 14
      });
      
      console.log('Escrow payment response:', response);
      
      if (response.success && response.clientSecret) {
        await AsyncStorage.setItem('currentPaymentId', response.paymentId);
        return response.clientSecret;
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating escrow payment:', error);
      throw error;
    }
  };
  
  const handlePayment = async () => {
    setLoading(true);
    try {
      const clientSecret = await PaymentIntent();
      
      if (!clientSecret) {
        Alert.alert('Error', 'Could not obtain payment credentials');
        setLoading(false);
        return;
      }
      
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        style: 'alwaysLight',
        merchantDisplayName: 'Your Company Name',
      });
      
      if (!error) {
        const { error: paymentError } = await presentPaymentSheet();
        
        if (!paymentError) {
          try {
            // Get the stored payment ID
            const paymentId = await AsyncStorage.getItem('currentPaymentId');
            if (!paymentId) {
              throw new Error('Payment ID not found');
            }

            // Confirm the escrow payment
            const confirmResponse = await paymentService.confirmEscrowPayment(paymentId);
            
            if (confirmResponse.success) {
              // Emit socket event for escrow confirmation
              if (contractSocket && contract?.id) {
                contractSocket.emit('escrow_payment_confirmed', {
                  contractId: contract.id,
                  confirmedBy: userRole,
                  paymentId: paymentId
                });
              }
              setShowSuccessModal(true);
            } else {
              throw new Error(confirmResponse.message || 'Failed to confirm payment');
            }
          } catch (confirmError) {
            console.error('Confirmation error:', confirmError);
            Alert.alert('Warning', 'Payment processed but confirmation failed');
          }
        } else {
          Alert.alert('Payment Failed', paymentError.message);
        }
      } else {
        Alert.alert('Setup Error', error.message);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert(
        'Error',
        error.message || 'An unexpected error occurred during payment processing'
      );
    } finally {
      setLoading(false);
    }
  };

  const PAYMENT_METHODS: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit Card',
      description: 'Pay securely with your credit card',
      icon: 'credit-card',
      isAvailable: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: 'payment',
      isAvailable: false,
      comingSoon: true
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: 'account-balance',
      isAvailable: false,
      comingSoon: true
    }
  ];

  const renderContent = () => {
    // Check if all terms are accepted at the start of renderContent
    const allTermsAccepted = areAllTermsAccepted();

    switch (currentStep) {
      case 5:
        return userRole === 'company' ? (
          <View style={styles.paymentContainer}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            
            {/* Payment Summary */}
            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Contract Value</Text>
                <Text style={styles.summaryValue}>
                  {formatAmount(Number(contract?.payment_terms) || 1000)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Escrow Period</Text>
                <Text style={styles.summaryValue}>14 days</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotal}>Total to Pay</Text>
                <Text style={styles.summaryTotalValue}>
                  {formatAmount(Number(contract?.payment_terms) || 1000)}
                </Text>
              </View>
            </View>

            {/* Payment Methods */}
            <Text style={styles.sectionSubtitle}>Select Payment Method</Text>
            <View style={styles.paymentMethodsGrid}>
              {PAYMENT_METHODS.map(method => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  selected={selectedPaymentMethod === method.id}
                  onSelect={() => {
                    setSelectedPaymentMethod(method.id);
                    if (method.id === 'card') {
                      handlePayment();
                    }
                  }}
                />
              ))}
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <MaterialIcons name="security" size={24} color="#10B981" />
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>Secure Escrow Payment</Text>
                <Text style={styles.securityDescription}>
                  Your payment will be held securely in escrow until the contract terms are fulfilled
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <PaymentStatusView contract={contract!} />
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

  const SuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent
      animationType="fade"
    >
      <View style={styles.successModalContainer}>
        <ConfettiCannon
          count={200}
          origin={{x: -10, y: 0}}
          autoStart={true}
          fadeOut={true}
        />
        <View style={styles.successModalContent}>
          <MaterialIcons name="check-circle" size={80} color="#10B981" />
          <Text style={styles.successModalTitle}>Payment Successful!</Text>
          <Text style={styles.successModalText}>
            Your payment has been securely held in escrow
          </Text>
          <View style={styles.successModalButtons}>
            <TouchableOpacity
              style={[styles.successModalButton, styles.successModalButtonPrimary]}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.successModalButtonText}>Go to Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successModalButtonTextSecondary}>Stay Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Add this component for the history badge
  const HistoryBadge = ({ count }: { count: number }) => (
    count > 0 ? (
      <View style={styles.historyBadge}>
        <Text style={styles.historyBadgeText}>{count}</Text>
      </View>
    ) : null
  );

  // Add this helper function to format dates
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Update the TermHistoryModal component
  const TermHistoryModal = ({ visible, onClose, termHistory }: { 
    visible: boolean;
    onClose: () => void;
    termHistory: Record<number, TermHistory[]>;
  }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.historyModalContainer}>
        <View style={styles.historyModalContent}>
          <View style={styles.historyModalHeader}>
            <Text style={styles.historyModalTitle}>Terms Change History</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.historyModalScroll}>
            {Object.entries(termHistory).map(([termId, changes]) => (
              <View key={termId} style={styles.historyTermSection}>
                <Text style={styles.historyTermTitle}>Term #{termId}</Text>
                {changes.map((change, index) => (
                  <View key={index} style={styles.historyChangeItem}>
                    <View style={styles.historyChangeHeader}>
                      <MaterialIcons name="history" size={20} color="#8B5CF6" />
                      <View style={styles.historyChangeInfo}>
                        <Text style={styles.historyChangeAuthor}>
                          Updated by {change.updatedBy}
                        </Text>
                        <Text style={styles.historyChangeDate}>
                          {formatTimeAgo(new Date(change.timestamp))}
                        </Text>
                      </View>
                      <Text style={styles.historyChangeExactTime}>
                        {new Date(change.timestamp).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.historyChangeContent}>
                      <Text style={styles.historyChangeLabel}>Previous Title:</Text>
                      <Text style={styles.historyChangeValue}>{change.previousTitle}</Text>
                      <Text style={styles.historyChangeLabel}>Previous Description:</Text>
                      <Text style={styles.historyChangeValue}>{change.previousDescription}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Add this component for the influencer's payment status view
  const PaymentStatusView = ({ contract }: { contract: Contract }) => {
    const [paymentStatus, setPaymentStatus] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchPaymentStatus = async () => {
        try {
          const response = await paymentService.getPaymentStatus(contract.id.toString());
          setPaymentStatus(response.status);
        } catch (error) {
          console.error('Error fetching payment status:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPaymentStatus();
    }, [contract.id]);

    return (
      <View style={styles.paymentStatusContainer}>
        <Text style={styles.sectionTitle}>Payment Status</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <MaterialIcons 
                name={paymentStatus === 'escrow_held' ? 'lock' : 'lock-open'} 
                size={24} 
                color="#10B981" 
              />
              <Text style={styles.statusAmount}>
                {formatAmount(Number(1000))}
              </Text>
            </View>

            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={[
                styles.statusBadge,
                styles[`status${paymentStatus}`]
              ]}>
                <Text style={styles.statusText}>
                  {paymentStatus === 'escrow_held' ? 'Held in Escrow' : 
                   paymentStatus === 'escrow_released' ? 'Released' :
                   paymentStatus === 'pending' ? 'Pending' : 'Processing'}
                </Text>
              </View>
            </View>

            <Text style={styles.statusDescription}>
              {paymentStatus === 'escrow_held' ? 
                'Payment is securely held in escrow until contract completion' :
                paymentStatus === 'escrow_released' ?
                'Payment has been released to your account' :
                'Awaiting payment confirmation'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contract Details</Text>
        <View style={styles.headerActions}>
          {currentStep === 3 && (
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
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <View style={styles.stepWrapper}>
                  <TouchableOpacity 
                    style={[
                      styles.stepCircle,
                      step < currentStep && styles.completedStep,
                      step === currentStep && styles.activeStep,
                    ]}
                    onPress={() => {
                      if (step === 3 && Object.keys(termHistory).length > 0) {
                        setShowHistoryModal(true);
                      }
                    }}
                    disabled={step === 3 ? false : true}
                  >
                    {step < currentStep ? (
                      <MaterialIcons name="check" size={20} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepText}>{step}</Text>
                    )}
                    {step === 3 && (
                      <HistoryBadge 
                        count={Object.values(termHistory).reduce((acc, curr) => acc + curr.length, 0)} 
                      />
                    )}
                  </TouchableOpacity>
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
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueButton}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
      <SuccessModal />
      <TermHistoryModal 
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        termHistory={termHistory}
      />
    </SafeAreaView>
  );
};

const PaymentMethodCard = ({ 
  method, 
  selected, 
  onSelect 
}: { 
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}) => (
  <TouchableOpacity 
    style={[
      styles.paymentMethodCard,
      selected && styles.selectedPaymentMethod,
      method.comingSoon && styles.comingSoonCard
    ]}
    onPress={onSelect}
    disabled={method.comingSoon}
  >
    <MaterialIcons 
      name={method.icon} 
      size={32} 
      color={method.comingSoon ? '#6B7280' : '#10B981'} 
    />
    <View style={styles.paymentMethodContent}>
      <Text style={[
        styles.paymentMethodName,
        method.comingSoon && styles.comingSoonText
      ]}>
        {method.name}
      </Text>
      <Text style={styles.paymentMethodDesc}>
        {method.description}
      </Text>
      {!method.comingSoon && (
        <Text style={styles.paymentMethodAmount}>
          {formatAmount(Number(1000))}
        </Text>
      )}
    </View>
    {method.comingSoon && (
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
      </View>
    )}
  </TouchableOpacity>
);

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
    position: 'relative',
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
    backgroundColor: '#000000',
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
    padding: 20,
  },
  paymentSummary: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  summaryTotal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTotalValue: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  sectionSubtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentMethodsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  paymentMethodCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectedPaymentMethod: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  comingSoonCard: {
    opacity: 0.5,
  },
  paymentMethodName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 12,
  },
  comingSoonText: {
    color: '#6B7280',
  },
  comingSoonBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  comingSoonBadgeText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
  },
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 12,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  paymentMethodContent: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodAmount: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  successModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#374151',
  },
  successModalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  successModalText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  successModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  successModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  successModalButtonPrimary: {
    backgroundColor: '#10B981',
  },
  successModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successModalButtonTextSecondary: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  historyBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A0A0A',
  },
  historyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  historyModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  historyModalContent: {
    backgroundColor: '#1F2937',
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  historyModalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  historyModalScroll: {
    padding: 20,
  },
  historyTermSection: {
    marginBottom: 24,
  },
  historyTermTitle: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyChangeItem: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  historyChangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  historyChangeInfo: {
    flex: 1,
  },
  historyChangeAuthor: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyChangeDate: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  historyChangeExactTime: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
  },
  historyChangeContent: {
    gap: 8,
  },
  historyChangeLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  historyChangeValue: {
    color: '#E5E5E5',
    fontSize: 14,
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentStatusContainer: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusescrow_held: {
    backgroundColor: '#065F46',
  },
  statusescrow_released: {
    backgroundColor: '#1D4ED8',
  },
  statuspending: {
    backgroundColor: '#92400E',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  }
});

export default SponsorshipTerms;