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

    // Function to render terms from backend
    const renderPreTerms = () => {
      if (!contract.pre_Terms || contract.pre_Terms.length === 0) {
        return '<p>No specific terms defined for this contract.</p>';
      }

      return contract.pre_Terms.map((term, index) => `
            <div class="terms-section">
                <h3>Term ${index + 1}: ${term.title}</h3>
                <div class="term-content">
                    <p>${term.description}</p>
                    <div class="term-status">Status: ${term.status}</div>
                </div>
            </div>
        `).join('');
    };

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 850px;
              margin: 0 auto;
              line-height: 1.6;
              color: #333;
            }
            * {
              box-sizing: border-box;
            }
            .container {
              width: 100%;
              margin: 0 auto;
            }
            .logo-header {
              text-align: center;
              margin-bottom: 40px;
              padding: 20px;
              border-bottom: 2px solid #0066cc;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #0066cc;
              margin-bottom: 10px;
            }
            .document-title {
              font-size: 24px;
              color: #333;
            }
            .agreement-date {
              text-align: center;
              margin-bottom: 30px;
              color: #666;
              font-size: 16px;
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
              background: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #dee2e6;
              min-height: fit-content;
            }
            .party-box h3 {
              margin: 0 0 20px 0;
              color: #0066cc;
              text-align: center;
              padding-bottom: 10px;
              border-bottom: 2px solid #dee2e6;
            }
            .info-field {
              margin-bottom: 12px;
              padding: 8px;
              background: white;
              border-radius: 4px;
            }
            .info-label {
              font-weight: bold;
              color: #495057;
              display: inline-block;
              width: 100px;
            }
            .info-value {
              color: #333;
            }
            .section {
              margin-bottom: 30px;
              padding: 25px;
              background: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #dee2e6;
            }
            .section h2 {
              color: #0066cc;
              text-align: center;
              padding-bottom: 10px;
              margin-top: 0;
              margin-bottom: 20px;
              border-bottom: 2px solid #dee2e6;
            }
            .terms-section {
              background: white;
              padding: 15px;
              border-radius: 6px;
              margin-bottom: 15px;
            }
            .terms-section h3 {
              color: #495057;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .terms-list {
              padding-left: 20px;
              margin: 0;
            }
            .terms-list li {
              margin-bottom: 15px;
              line-height: 1.6;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              gap: 40px;
              margin-top: 50px;
              padding: 30px;
              background: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #dee2e6;
            }
            .signature-box {
              flex: 1;
              text-align: center;
              padding: 20px;
              background: white;
              border-radius: 6px;
            }
            .signature-box h3 {
              color: #0066cc;
              margin-bottom: 20px;
            }
            .signature-image {
              max-width: 200px;
              margin: 15px auto;
              display: block;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin: 70px auto 10px;
              width: 80%;
            }
            .date-line {
              margin-top: 15px;
              color: #666;
            }
            .term-content {
                background: white;
                padding: 15px;
                border-radius: 6px;
                margin-top: 10px;
            }
            .term-status {
                margin-top: 10px;
                padding: 5px 10px;
                background: #e9ecef;
                border-radius: 4px;
                display: inline-block;
                font-size: 14px;
                color: #495057;
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
                <div class="info-field">
                ${contract.Deals?.[0]?.ContentCreatorDeals?.accounts?.map(account => `
                  <div class="info-field">
                    <span class="info-label">${account.platform}:</span>
                    <span class="info-value">${account.username}</span>
                  </div>
                `).join('') || ''}
              </div>
            </div>
          </div>

          <div class="section">
            <h2>1. Agreement Details</h2>
            <div class="terms-section">
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
            ${renderPreTerms()}
          </div>

          <div class="section">
            <h2>5. Standard Terms and Conditions</h2>
            
            <div class="terms-section">
              <h3>5.1 Content Requirements</h3>
              <ul class="terms-list">
                <li>All content must be original and created specifically for this campaign.</li>
                <li>Content must comply with platform guidelines and applicable laws.</li>
                <li>The Company has the right to review content before publication.</li>
                <li>Content must be posted during peak engagement hours.</li>
              </ul>
            </div>

            <div class="terms-section">
              <h3>5.2 Deliverables</h3>
              <ul class="terms-list">
                <li>Content Creator will provide detailed analytics and engagement metrics.</li>
                <li>Regular progress updates will be shared through the Sponsofy platform.</li>
                <li>All agreed-upon content must be delivered according to the timeline.</li>
              </ul>
            </div>

            <div class="terms-section">
              <h3>5.3 Intellectual Property</h3>
              <ul class="terms-list">
                <li>Content Creator retains ownership of original content.</li>
                <li>Company receives license to use content for promotional purposes.</li>
                <li>Both parties must respect each other's intellectual property rights.</li>
              </ul>
            </div>

            <div class="terms-section">
              <h3>5.4 Confidentiality</h3>
              <ul class="terms-list">
                <li>Both parties agree to maintain confidentiality of sensitive information.</li>
                <li>Campaign details should not be shared before official launch.</li>
                <li>Non-disclosure agreement applies to all proprietary information.</li>
              </ul>
            </div>

            <div class="terms-section">
              <h3>5.5 Termination</h3>
              <ul class="terms-list">
                <li>30-day written notice required for early termination.</li>
                <li>Pro-rated payment for completed work in case of early termination.</li>
                <li>Immediate termination allowed for breach of agreement.</li>
              </ul>
            </div>

            <div class="terms-section">
              <h3>5.6 Dispute Resolution</h3>
              <ul class="terms-list">
                <li>Disputes will be resolved through mediation first.</li>
                <li>Sponsofy platform's dispute resolution system will be used.</li>
                <li>Legal action only as last resort.</li>
              </ul>
            </div>
          </div>

          <div class="signatures">
            <div class="signature-box">
              <h3>Company Representative</h3>
              ${companySignature ? `
                <img src="${getSignatureUrl(companySignature)}" alt="Company Signature" class="signature-image" />
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
                <img src="${getSignatureUrl(creatorSignature)}" alt="Creator Signature" class="signature-image" />
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
