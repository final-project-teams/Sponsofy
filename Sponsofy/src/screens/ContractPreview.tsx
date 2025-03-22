import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { API_URL } from '../config/source';
import api from '../config/axios';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';

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
  const contractId = 4;
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
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      alignItems: 'flex-start',
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
      marginTop: 50,
      marginBottom: 10,
    },
    contractTitle: {
      fontSize: currentTheme.fontSizes.xlarge,
      fontFamily: currentTheme.fonts.semibold,
      color: currentTheme.colors.text,
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
      borderRadius: 20,
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
    downloadButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#333',
      borderRadius: 30,
      padding: 15,
      elevation: 5,
    },
    downloadIcon: {
      color: '#fff',
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

  const generatePDF = async () => {
    if (!contract) return;

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: ${currentTheme.colors.background};
              color: ${currentTheme.colors.text};
              padding: 20px;
            }
            h1, h2, h3 {
              color: ${currentTheme.colors.text};
            }
            .section {
              margin-bottom: 20px;
            }
            .contract-info, .signatures {
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Contract Preview</h1>
          <div class="section contract-info">
            <h2>Contract Title: ${contract.title}</h2>
            <p><strong>Contract ID:</strong> ${contract.id}</p>
            <p><strong>Company:</strong> ${contract.Company?.name}</p>
            <p><strong>Amount:</strong> $${contract.budget}</p>
            <p><strong>Start Date:</strong> ${new Date(contract.start_date).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${new Date(contract.end_date).toLocaleDateString()}</p>
            <p><strong>Rank:</strong> ${contract.rank}</p>
            <p><strong>Description:</strong> ${contract.description}</p>
            <p><strong>Payment Terms:</strong> ${contract.payment_terms}</p>
          </div>
          <div class="section signatures">
            <h3>Signatures</h3>
            <div>
              <h4>Company's Signature</h4>
              ${companySignature ? `
                <img src="${getSignatureUrl(companySignature)}" alt="Company Signature" width="150" height="100" />
                <p>${contract.Company?.name}'s Signature</p>
                <p>Date: ${new Date(companySignature.created_at).toLocaleDateString()}</p>
              ` : `<p>Pending signature</p>`}
            </div>
            <div>
              <h4>Content Creator's Signature</h4>
              ${creatorSignature ? `
                <img src="${getSignatureUrl(creatorSignature)}" alt="Creator Signature" width="150" height="100" />
                <p>${contract.Deals?.[0]?.ContentCreatorDeals?.user?.username || 'Content Creator'}'s Signature</p>
                <p>Date: ${new Date(creatorSignature.created_at).toLocaleDateString()}</p>
              ` : `<p>Pending signature</p>`}
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.contractCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Contract Preview</Text>
            <Text style={styles.label}>Contract Title</Text>
            <Text style={styles.contractTitle}>{contract.title}</Text>
            <Text style={styles.label}>Contract ID</Text>
            <Text style={styles.contractTitle}>{contract.id}</Text>
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
              <Text style={styles.value}>{new Date(contract.start_date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>End Date:</Text>
              <Text style={styles.value}>{new Date(contract.end_date).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Terms</Text>
            <Text style={styles.text}>{contract.payment_terms}</Text>
          </View>

          <View style={styles.signatureSection}>
            <Text style={styles.sectionTitle}>Signatures</Text>
            <View style={styles.signatureContainer}>
              <View style={styles.signatureBox}>
                <Image
                  source={{ uri: getSignatureUrl(companySignature) || '' }}
                  style={styles.signatureImage}
                />
                <Text style={styles.signatureName}>Company's Signature</Text>
                {companySignature ? (
                  <Text style={styles.signatureDate}>
                    {new Date(companySignature.created_at).toLocaleDateString()}
                  </Text>
                ) : (
                  <Text style={styles.signatureDate}>Pending signature</Text>
                )}
              </View>
              <View style={styles.signatureBox}>
                <Image
                  source={{ uri: getSignatureUrl(creatorSignature) || '' }}
                  style={styles.signatureImage}
                />
                <Text style={styles.signatureName}>Content Creator's Signature</Text>
                {creatorSignature ? (
                  <Text style={styles.signatureDate}>
                    {new Date(creatorSignature.created_at).toLocaleDateString()}
                  </Text>
                ) : (
                  <Text style={styles.signatureDate}>Pending signature</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={generatePDF} style={styles.downloadButton}>
          <Ionicons name="download-outline" size={24} style={styles.downloadIcon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ContractPreview;
