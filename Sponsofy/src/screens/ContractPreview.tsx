import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { API_URL } from '../config/source';
import api from '../config/axios';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';
// @ts-ignore
import logo from '../../assets/logo.png';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define navigation type
type RootStackParamList = {
  SignatureManagement: undefined;
  QRCodeVerifier: undefined;
  // Add other screens as needed
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

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
  serialNumber: string;
  Company: {
    name: string;
    user: {
      id: number;
      username: string;
      email: string;
    }
  };
  Deals: [{
    ContentCreatorDeals: {
      user: {
        id: number;
        username: string;
        email: string;
      }
    }
  }];
  createdAt: string;
  pre_Terms?: {
    id: number;
    title: string;
    description: string;
    status: string;
  }[];
}

interface Signature {
  id: number;
  signature_data: string;
  userId: number;
  created_at: string;
}

const ContractPreview = ({ route }) => {
  const contractId = 1;
  const { currentTheme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [companySignature, setCompanySignature] = useState<Signature | null>(null);
  const [creatorSignature, setCreatorSignature] = useState<Signature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qrCodeRef = useRef<any>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.black,
    },
    content: {
      padding: 20,
    },
    contractCard: {
      backgroundColor: currentTheme.colors.black,
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
      marginBottom: 30,
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
      padding: 25,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      backgroundColor: currentTheme.colors.background,
    },
    sectionTitle: {
      fontSize: currentTheme.fontSizes.large,
      fontFamily: currentTheme.fonts.semibold,
      color: currentTheme.colors.text,
      marginBottom: 20,
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
      backgroundColor: currentTheme.colors.white,
      marginLeft: 10,
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
      backgroundColor: currentTheme.colors.background,
      borderRadius: 30,
      padding: 15,
      elevation: 5,
    },
    downloadIcon: {
      color: '#fff',
    },
    qrSection: {
      marginBottom: 20,
      marginTop: 20,
      backgroundColor: currentTheme.colors.surface,
      padding: 15,
      borderRadius: 8,
    },
    qrContainer: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      marginVertical: 10,
      alignSelf: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    serialNumber: {
      fontSize: currentTheme.fontSizes.medium,
      fontFamily: currentTheme.fonts.medium,
      color: currentTheme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 10,
    },
    QRCodeTitle: {
      fontSize: currentTheme.fontSizes.large,
      fontFamily: currentTheme.fonts.bold,
      color: currentTheme.colors.text,
      textAlign: 'left',
      marginLeft: -15,
      marginBottom: 10,
    },
    verifyButton: {
      backgroundColor: currentTheme.colors.surface,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 15,
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.primary,
    },
    verifyButtonText: {
      color: currentTheme.colors.white,
      fontSize: currentTheme.fontSizes.medium,
      fontFamily: currentTheme.fonts.semibold,
      marginLeft: 8,
    },
    termTitle: {
      fontSize: currentTheme.fontSizes.large,
      fontFamily: currentTheme.fonts.bold,
      color: currentTheme.colors.text,
      textAlign: 'left',
      marginLeft: -15,
      marginBottom: 15,
    },
    termDescription: {
      fontSize: currentTheme.fontSizes.medium,
      fontFamily: currentTheme.fonts.regular,
      color: currentTheme.colors.textSecondary,
    }
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

    // Create QR code URL using a web service
    const qrCodeData = encodeURIComponent(JSON.stringify({
      id: contract.id,
      serialNumber: contract.serialNumber,
    }));
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeData}`;

    const htmlContent = `
      <html>
        <head>
          <style>
            :root {
              --color-background: #121212;
              --color-surface-1: #1E1E1E;
              --color-surface-2: #2D2D2D;
              --color-primary: #8B5CF6;
              --color-text: #FFFFFF;
              --color-text-secondary: #A0A0A0;
              --color-border: #333333;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 950px;
              margin: 0;
              line-height: 1.6;
              color: var(--color-text);
              background-color: var(--color-background);
            }
            .logo-header {
              text-align: center;
              margin-bottom: 40px;
              padding: 20px;
              border-bottom: 2px solid var(--color-primary);
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: var(--color-primary);
              margin-bottom: 10px;
            }
            .document-title {
              font-size: 24px;
              color: var(--color-text);
            }
            .agreement-date {
              color: var(--color-text-secondary);
            }
            .party-info {
              display: flex;
              justify-content: space-between;
              gap: 30px;
              margin-bottom: 40px;
            }
            .party-box {
              flex: 1;
              padding: 25px;
              background: var(--color-surface-1);
              border-radius: 8px;
              border: 1px solid var(--color-border);
            }
            .party-box h3 {
              color: var(--color-primary);
              text-align: center;
              padding-bottom: 10px;
              border-bottom: 1px solid var(--color-border);
            }
            .info-field {
              margin-bottom: 12px;
              padding: 8px;
              background: var(--color-surface-2);
              border-radius: 4px;
            }
            .info-label {
              font-weight: bold;
              color: var(--color-text-secondary);
              display: inline-block;
              width: 100px;
            }
            .info-value {
              color: var(--color-text);
            }
            .section {
              margin-bottom: 30px;
              padding: 25px;
              background: var(--color-surface-1);
              border-radius: 8px;
              border: 1px solid var(--color-border);
            }
            .section h2 {
              color: var(--color-primary);
              text-align: center;
              padding-bottom: 10px;
              margin-top: 0;
              border-bottom: 1px solid var(--color-border);
            }
            .terms-section {
              background: var(--color-surface-2);
              padding: 15px;
              border-radius: 6px;
              margin-bottom: 15px;
            }
            .terms-section h3 {
              color: var(--color-primary);
              margin-bottom: 15px;
            }
            .terms-list {
              padding-left: 20px;
              margin: 0;
              color: var(--color-text);
            }
            .terms-list li {
              margin-bottom: 15px;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              gap: 40px;
              margin-top: 50px;
              padding: 30px;
              background: var(--color-surface-1);
              border-radius: 8px;
              border: 1px solid var(--color-border);
            }
            .signature-box {
              flex: 1;
              text-align: center;
              padding: 20px;
              background: var(--color-surface-2);
              border-radius: 6px;
            }
            .signature-box h3 {
              color: var(--color-primary);
            }
            .signature-line {
              border-top: 1px solid var(--color-text);
              margin: 70px auto 10px;
              width: 80%;
            }
            .signature-image {
              max-width: 200px;
              margin: 15px auto;
              display: block;
            }
            .date-line {
              color: var(--color-text-secondary);
            }
            .term-content {
              background: var(--color-surface-2);
              padding: 15px;
              border-radius: 6px;
              color: var(--color-text);
            }
            .term-status {
              margin-top: 10px;
              padding: 5px 10px;
              background: var(--color-surface-1);
              border-radius: 4px;
              display: inline-block;
              font-size: 14px;
              color: var(--color-text-secondary);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo-header">
              <div class="logo">Sponsofy</div>
              <div class="document-title">Sponsorship Agreement</div>
            </div>

            <div class="agreement-date">
              Agreement Date: ${new Date().toLocaleDateString()}
            </div>

            <div class="party-info">
              <div class="party-box">
                <h3>Company Information</h3>
                <div class="info-field">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${contract.Company?.name}</span>
                </div>
                <div class="info-field">
                  <span class="info-label">Username:</span>
                  <span class="info-value">${contract.Company?.user?.username}</span>
                </div>
                <div class="info-field">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${contract.Company?.user?.email || 'N/A'}</span>
                </div>
              </div>

              <div class="party-box">
                <h3>Content Creator Information</h3>
                <div class="info-field">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${contract.Deals?.[0]?.ContentCreatorDeals?.user?.username || 'N/A'}</span>
                </div>
                <div class="info-field">
                  <span class="info-label">Username:</span>
                  <span class="info-value">${contract.Deals?.[0]?.ContentCreatorDeals?.user?.username}</span>
                </div>
                <div class="info-field">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${contract.Deals?.[0]?.ContentCreatorDeals?.user?.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>1. Agreement Details</h2>
            <div class="terms-section">
              <div class="info-field">
                <span class="info-label">Serial No:</span>
                <span class="info-value">${contract.serialNumber || 'N/A'}</span>
              </div>
              <div class="info-field">
                <span class="info-label">Contract ID:</span>
                <span class="info-value">${contract.id}</span>
              </div>
              <div class="info-field">
                <span class="info-label">Start Date:</span>
                <span class="info-value">${new Date(contract.start_date).toLocaleDateString()}</span>
              </div>
              <div class="info-field">
                <span class="info-label">End Date:</span>
                <span class="info-value">${new Date(contract.end_date).toLocaleDateString()}</span>
              </div>
              <div class="info-field">
                <span class="info-label">Budget:</span>
                <span class="info-value">$${contract.budget}</span>
              </div>
              <div class="info-field">
                <span class="info-label">Rank:</span>
                <span class="info-value">${contract.rank}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>2. Scope of Services</h2>
            <div class="terms-section">
              <p>${contract.description}</p>
            </div>
          </div>

          <div class="section">
            <h2>3. Payment Terms</h2>
            <div class="terms-section">
              <p>${contract.payment_terms}</p>
            </div>
          </div>

          <div class="section">
            <h2>4. Contract Terms</h2>
            ${contract.pre_Terms?.map(term => `
              <div class="terms-section">
                <h3>${term.title}</h3>
                <p>${term.description}</p>
              </div>
            `).join('')}
          </div>

          <div class="section">
    <h2>5. Sponsofy's Terms and Conditions</h2>
    
    <div class="terms-section">
        <h3>5.1 User Responsibilities</h3>
        <ul class="terms-list">
            <li>Users are responsible for ensuring the accuracy and legality of their content.</li>
            <li>Sponsofy does not guarantee engagement, reach, or financial success from campaigns.</li>
            <li>All interactions between users, including payments, are the sole responsibility of the involved parties.</li>
        </ul>
    </div>
    
    <div class="terms-section">
        <h3>5.2 Content Ownership</h3>
        <ul class="terms-list">
            <li>Content creators retain ownership of their original content unless explicitly agreed otherwise.</li>
            <li>Sponsofy reserves a limited license to display and promote listed content within the platform.</li>
            <li>Sponsofy is not responsible for any copyright claims or disputes.</li>
        </ul>
    </div>
    
    <div class="terms-section">
        <h3>5.3 Payment and Transactions</h3>
        <ul class="terms-list">
            <li>All payments and financial transactions are handled directly between users.</li>
            <li>Sponsofy is not responsible for payment failures, disputes, or refunds.</li>
            <li>Users must resolve financial conflicts independently or through designated third-party services.</li>
        </ul>
    </div>
    
    <div class="terms-section">
        <h3>5.4 Liability Limitation</h3>
        <ul class="terms-list">
            <li>Sponsofy is not liable for any damages, losses, or claims resulting from platform use.</li>
            <li>Users acknowledge that they use the platform at their own risk.</li>
            <li>Sponsofy does not endorse or verify any user-provided content, services, or claims.</li>
        </ul>
    </div>
    
    <div class="terms-section">
        <h3>5.5 Privacy and Confidentiality</h3>
        <ul class="terms-list">
            <li>Users must handle confidential campaign details responsibly.</li>
            <li>Sponsofy does not monitor private communications but reserves the right to investigate misuse.</li>
            <li>Users should take necessary precautions when sharing sensitive information.</li>
        </ul>
    </div>
    
    <div class="terms-section">
        <h3>5.6 Termination and Account Suspension</h3>
        <ul class="terms-list">
            <li>Sponsofy reserves the right to suspend or terminate accounts at its discretion.</li>
            <li>Users may deactivate accounts, but obligations under these terms remain in effect.</li>
            <li>Violation of policies may result in immediate removal from the platform.</li>
        </ul>
    </div>
    
    <div class="terms-section">
        <h3>5.7 Dispute Resolution</h3>
        <ul class="terms-list">
            <li>Disputes should first be resolved through direct negotiation.</li>
            <li>Sponsofy provides optional mediation tools but is not responsible for dispute outcomes.</li>
                <li>Legal action should only be taken as a last resort.</li>
            </ul>
        </div>
    </div>

          <div class="section">
            <h2>Contract Verification</h2>
            <div class="terms-section" style="text-align: center;">
              <div style="background: white; padding: 20px; display: inline-block; border-radius: 8px; margin: 20px 0;">
                <img src="${qrCodeUrl}" alt="Contract QR Code" style="width: 200px; height: 200px;"/>
              </div>
              <p style="color: var(--color-text-secondary); margin-top: 10px;">
                Serial Number: ${contract.serialNumber || 'N/A'}
              </p>
              <p style="color: var(--color-text-secondary); font-size: 14px; margin-top: 5px;">
                Scan to verify contract authenticity
              </p>
            </div>
          </div>

          <div class="signatures">
            <div class="signature-box">
              <h3>Company Representative</h3>
              ${companySignature ? `
                <img class="signature-image" src="${getSignatureUrl(companySignature)}" alt="Company Signature" class="signature-image" />
                <p>${contract.Company?.name}</p>
                <p class="date-line">Date: ${new Date(companySignature.created_at).toLocaleDateString()}</p>
              ` : `
                <div class="signature-line">Signature</div>
                <p class="date-line">Date: _____________</p>
              `}
            </div>

            <div class="signature-box">
              <h3>Content Creator</h3>
              ${creatorSignature ? `
                <img class="signature-image" src="${getSignatureUrl(creatorSignature)}" alt="Creator Signature" class="signature-image" />
                <p>${contract.Deals?.[0]?.ContentCreatorDeals?.user?.username || 'Content Creator'}</p>
                <p class="date-line">Date: ${new Date(creatorSignature.created_at).toLocaleDateString()}</p>
              ` : `
                <div class="signature-line">Signature</div>
                <p class="date-line">Date: _____________</p>
              `}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    try {
      const { uri } = await printToFileAsync({
        html: htmlContent,
        base64: false
      });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const generateQRCode = async (data: string) => {
    // You'll need to implement this function to generate a base64 QR code
    // You can use a library like qrcode or react-native-qrcode-svg
    // For now, this is a placeholder
    return '';
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

  const qrData = JSON.stringify({
    id: contract.id,
    serialNumber: contract.serialNumber,
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.contractCard}>
          
          <Text style={styles.title}>Contract Preview</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contract Information</Text>
            <Text style={styles.label}>Serial Number</Text>
            <Text style={styles.contractTitle}>{contract.serialNumber}</Text>
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
              <Text style={styles.label}>Content Creator:</Text>
              <Text style={styles.value}>{contract.Deals?.[0]?.ContentCreatorDeals?.user?.username || 'N/A'}</Text>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contract Terms</Text>
            {contract.pre_Terms?.map((term, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.termTitle}>{term.title}</Text>
                <Text style={styles.termDescription}>{term.description || 'No description'}</Text>
              </View>
              
            ))}
          </View>
          <View style={styles.section}>
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>Contract QR Code</Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrData}
                  size={200}
                  backgroundColor="white"
                  color="black"
                  logo={logo}
                  getRef={(c) => (qrCodeRef.current = c)}
                />
              </View>
              <Text style={styles.serialNumber}>Serial Number: {contract.serialNumber || 'N/A'}</Text>

              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => navigation.navigate('QRCodeVerifier')}
              >
                <Ionicons name="qr-code-outline" size={20} color={currentTheme.colors.white} />
                <Text style={styles.verifyButtonText}>Verify Contract</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Signatures</Text>
            <View style={styles.signatureContainer}>
              <TouchableOpacity
                style={styles.signatureBox}
                onPress={() => navigation.navigate('SignatureManagement')}
              >
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
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.signatureBox}
                onPress={() => navigation.navigate('SignatureManagement')}
              >
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
              </TouchableOpacity>
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
