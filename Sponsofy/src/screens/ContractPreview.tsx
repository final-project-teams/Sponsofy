import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { API_URL } from '../config/source';
import api from '../config/axios';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

    interface Contract {
        id: number;
        title: string;
        description: string;
      budget: number;
      payment_terms: string;
      start_date: string;
      end_date: string;
      rank: string;
      status: string;
      Company: {
        name: string;
        user: {
          id: number;
          username: string;
        }
      };
      Deals: [{
        ContentCreatorDeals: {
          user: {
            id: number;
            username: string;
          }
        }
      }];
        createdAt: string;
}

interface Signature {
  id: number;
  signature_data: string;
  userId: number;
  created_at: string;
}

const ContractPreview = ({ route }) => {
  const  contractId  = 4;
  const { currentTheme } = useTheme();
  const [contract, setContract] = useState<Contract | null>(null);
  const [companySignature, setCompanySignature] = useState<Signature | null>(null);
  const [creatorSignature, setCreatorSignature] = useState<Signature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    content: {
      padding: 20,
    },
    contractCard: {
      backgroundColor: currentTheme.colors.surface,
      borderRadius: currentTheme.borderRadius.large,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
      paddingBottom: 20,
    },
    title: {
      fontSize: currentTheme.fontSizes.xxlarge,
      fontFamily: currentTheme.fonts.semibold,
      color: currentTheme.colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    contractId: {
      fontSize: currentTheme.fontSizes.small,
      fontFamily: currentTheme.fonts.medium,
      color: currentTheme.colors.textSecondary,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: currentTheme.fontSizes.large,
      fontFamily: currentTheme.fonts.semibold,
      color: currentTheme.colors.text,
      marginBottom: 10,
    },
    text: {
      fontSize: currentTheme.fontSizes.medium,
      fontFamily: currentTheme.fonts.regular,
      color: currentTheme.colors.text,
      lineHeight: 24,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    label: {
      fontSize: currentTheme.fontSizes.medium,
      fontFamily: currentTheme.fonts.medium,
      color: currentTheme.colors.textSecondary,
    },
    value: {
      fontSize: currentTheme.fontSizes.medium,
      fontFamily: currentTheme.fonts.regular,
      color: currentTheme.colors.text,
    },
    signatureSection: {
      marginTop: 30,
      borderTopWidth: 1,
      borderTopColor: currentTheme.colors.border,
      paddingTop: 20,
    },
    signatureContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    signatureBox: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 10,
    },
    signatureImage: {
      width: 150,
      height: 100,
      borderRadius: currentTheme.borderRadius.medium,
      marginBottom: 10,
    },
    signatureName: {
      fontSize: currentTheme.fontSizes.small,
      fontFamily: currentTheme.fonts.medium,
      color: currentTheme.colors.text,
      textAlign: 'center',
    },
    signatureDate: {
      fontSize: currentTheme.fontSizes.small,
      fontFamily: currentTheme.fonts.regular,
      color: currentTheme.colors.textSecondary,
      textAlign: 'center',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'center',
      marginBottom: 20,
    },
    statusText: {
      fontSize: currentTheme.fontSizes.small,
      fontFamily: currentTheme.fonts.medium,
      color: currentTheme.colors.white,
    },
  });

  const getSignatureUrl = (signature: Signature | null) => {
    if (!signature || !signature.signature_data) return null;

    if (signature.signature_data.startsWith('http')) {
      return signature.signature_data;
    }
    return `${API_URL}/uploads/signatures/${signature.signature_data.split('/').pop()}`;
  };

  const fetchContractAndSignatures = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching contract:', contractId);
      const response = await api.get(`${API_URL}/contract/detail/${contractId}`);
      console.log('Contract response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch contract');
      }

      const contractData = response.data.contract;
      setContract(contractData);

      // Signatures are now included in the contract response
      if (contractData.signatures) {
        setCompanySignature(contractData.signatures.companySignature);
        setCreatorSignature(contractData.signatures.creatorSignature);
      }

    } catch (err) {
      console.error('Error fetching contract details:', err);
      setError(err.message || 'Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      fetchContractAndSignatures();
    }
  }, [contractId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle" size={48} color={currentTheme.colors.error} />
        <Text style={[styles.text, { color: currentTheme.colors.error, marginTop: 10 }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="document-outline" size={48} color={currentTheme.colors.textSecondary} />
        <Text style={[styles.text, { marginTop: 10 }]}>Contract not found</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'completed':
        return '#2196F3';
      case 'terminated':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.contractCard}>
          <View style={styles.header}>
            <Text style={styles.title}>{contract.title}</Text>
            <Text style={styles.contractId}>Contract ID: {contract.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) }]}>
              <Text style={styles.statusText}>{contract.status}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contract Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Company:</Text>
              <Text style={styles.value}>{contract.Company?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Amount:</Text>
              <Text style={styles.value}>${contract.budget}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Start Date:</Text>
              <Text style={styles.value}>
                {new Date(contract.start_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>End Date:</Text>
              <Text style={styles.value}>
                {new Date(contract.end_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Rank:</Text>
              <Text style={styles.value}>{contract.rank}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.text}>{contract.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Terms</Text>
            <Text style={styles.text}>{contract.payment_terms}</Text>
          </View>

          <View style={styles.signatureSection}>
            <Text style={styles.sectionTitle}>Signatures</Text>
            <View style={styles.signatureContainer}>
              <View style={styles.signatureBox}>
                {companySignature ? (
                  <>
                    <Image
                      source={{ uri: getSignatureUrl(companySignature) }}
                      style={styles.signatureImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.signatureName}>Company Representative</Text>
                    <Text style={styles.signatureDate}>
                      {new Date(companySignature.created_at).toLocaleDateString()}
                    </Text>
                  </>
                ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="pencil-outline" size={32} color={currentTheme.colors.textSecondary} />
                      <Text style={[styles.text, { marginTop: 8 }]}>Pending signature</Text>
                    </View>
                )}
              </View>

              <View style={styles.signatureBox}>
                {creatorSignature ? (
                  <>
                    <Image
                      source={{ uri: getSignatureUrl(creatorSignature) }}
                      style={styles.signatureImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.signatureName}>Content Creator</Text>
                    <Text style={styles.signatureDate}>
                      {new Date(creatorSignature.created_at).toLocaleDateString()}
                    </Text>
                  </>
                ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="pencil-outline" size={32} color={currentTheme.colors.textSecondary} />
                      <Text style={[styles.text, { marginTop: 8 }]}>Pending signature</Text>
                    </View>
                )}
              </View>
            </View>
          </View>
        </View>
    </View>
    </ScrollView>
  );
};

export default ContractPreview;