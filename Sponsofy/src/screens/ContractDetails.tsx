// src/screens/ContractDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../theme/ThemeContext';
import api from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from '../../assets/logo.png';

const ContractDetailsScreen = ({ route, navigation }) => {
    const { contractId } = route.params;
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentTheme } = useTheme();

    // Define styles at the top level of the component
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.colors.background,
        },
        centered: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        header: {
            padding: 20,
            backgroundColor: currentTheme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.colors.border,
        },
        backButton: {
            position: 'absolute',
            top: 40,
            left: 20,
            zIndex: 10,
        },
        title: {
            fontSize: currentTheme.fontSizes.xlarge,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
            marginTop: 50,
            textAlign: 'center',
        },
        qrSection: {
            alignItems: 'center',
            padding: 20,
            marginVertical: 20,
            backgroundColor: currentTheme.colors.surface,
            borderRadius: currentTheme.borderRadius.large,
            marginHorizontal: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        qrContainer: {
            padding: 20,
            backgroundColor: '#FFFFFF',
            borderRadius: currentTheme.borderRadius.medium,
            marginVertical: 15,
        },
        serialNumber: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
            color: currentTheme.colors.text,
            marginTop: 10,
            textAlign: 'center',
        },
        section: {
            margin: 20,
            padding: 20,
            backgroundColor: currentTheme.colors.surface,
            borderRadius: currentTheme.borderRadius.large,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        sectionTitle: {
            fontSize: currentTheme.fontSizes.large,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
            marginBottom: 15,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.colors.border,
        },
        lastInfoRow: {
            borderBottomWidth: 0,
        },
        infoLabel: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
            color: currentTheme.colors.textSecondary,
        },
        infoValue: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.text,
            textAlign: 'right',
            flex: 1,
            marginLeft: 20,
        },
        badgeContainer: {
            flexDirection: 'row',
            marginTop: 15,
            justifyContent: 'center',
        },
        badge: {
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 20,
            marginHorizontal: 5,
        },
        badgeText: {
            fontSize: currentTheme.fontSizes.small,
            fontFamily: currentTheme.fonts.medium,
            color: '#FFFFFF',
        },
        description: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.text,
            lineHeight: 24,
        },
        errorText: {
            color: currentTheme.colors.error,
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
            textAlign: 'center',
            padding: 20,
        },
        instruction: {
            fontSize: currentTheme.fontSizes.small,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.textSecondary,
            textAlign: 'center',
            marginTop: 10,
        },
        dateValue: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.text,
        },
    });

    useEffect(() => {
        const fetchContractDetails = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                console.log('Fetching contract details for ID:', contractId); // Debug log

                const response = await api.get(`/contract/detail/${contractId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Contract response:', response.data); // Debug log

                if (response.data.success) {
                    setContract(response.data.contract);
                } else {
                    setError('Failed to load contract details');
                }
            } catch (err) {
                console.error('Error fetching contract details:', err);
                if (err.response) {
                    console.log('Error response:', err.response.data); // Debug log
                    setError(err.response.data.message || 'An error occurred while loading the contract');
                } else {
                    setError('An error occurred while loading the contract');
                }
            } finally {
                setLoading(false);
            }
        };

        if (contractId) {
            fetchContractDetails();
        } else {
            setError('No contract ID provided');
            setLoading(false);
        }
    }, [contractId]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={currentTheme.colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    // Create QR code data
    const qrData = JSON.stringify({
        id: contract.id,
        serialNumber: contract.serialNumber,
    });

    const getBadgeColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return '#4CAF50';
            case 'completed':
                return '#2196F3';
            case 'terminated':
                return '#F44336';
            default:
                return '#9E9E9E';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={currentTheme.colors.text} />
            </TouchableOpacity>

            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>{contract.title}</Text>
                    <View style={styles.badgeContainer}>
                        <View style={[styles.badge, { backgroundColor: getBadgeColor(contract.status) }]}>
                            <Text style={styles.badgeText}>{contract.status || 'Status N/A'}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: '#8B5CF6' }]}>
                            <Text style={styles.badgeText}>{contract.rank || 'Rank N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* QR Code Section */}
                <View style={styles.qrSection}>
                    <Text style={styles.sectionTitle}>Contract QR Code</Text>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={qrData}
                            size={200}
                            backgroundColor="white"
                            color="black"
                            logo={logo}
                        />
                    </View>
                    <Text style={styles.serialNumber}>Serial Number: {contract.serialNumber || 'N/A'}</Text>
                    <Text style={styles.instruction}>Scan this QR code to verify the contract details</Text>
                </View>

                {/* Contract Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contract Details</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Budget</Text>
                        <Text style={styles.infoValue}>${contract.budget || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Company</Text>
                        <Text style={styles.infoValue}>{contract.Company?.name || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Start Date</Text>
                        <Text style={styles.infoValue}>{formatDate(contract.start_date)}</Text>
                    </View>

                    <View style={[styles.infoRow, styles.lastInfoRow]}>
                        <Text style={styles.infoLabel}>End Date</Text>
                        <Text style={styles.infoValue}>{formatDate(contract.end_date)}</Text>
                    </View>
                </View>

                {/* Description Section */}
                {contract.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{contract.description}</Text>
                    </View>
                )}

                {/* Payment Terms Section */}
                {contract.payment_terms && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Terms</Text>
                        <Text style={styles.description}>{contract.payment_terms}</Text>
                    </View>
                )}

                {/* Add more sections as needed */}
            </ScrollView>
        </View>
    );
};

export default ContractDetailsScreen;