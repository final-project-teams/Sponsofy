import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { API_URL } from '../config/source';
import api from '../config/axios';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface VerifiedContract {
    id: number;
    serialNumber: string;
    title: string;
    status: string;
    createdAt: string;
    budget: number;
    rank: string;
    dealStatus: string;
    company: {
        name: string;
        username: string;
        email: string;
        industry: string;
        verified: boolean;
    };
    contentCreator: {
        username: string;
        email: string;
        verified: boolean;
        category: string;
    };
}

const QRCodeVerifier = () => {
    const { currentTheme } = useTheme();
    const [serialNumber, setSerialNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{
        success: boolean;
        message: string;
        contract?: VerifiedContract;
    } | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const verifyContract = async () => {
        try {
            setLoading(true);
            setVerificationResult(null);

            const response = await api.get(`${API_URL}/qr/verify/${serialNumber}`);

            if (response.data.success) {
                setVerificationResult({
                    success: true,
                    message: 'Contract Successfully Verified!',
                    contract: response.data.contract
                });
            }
            setShowModal(true);
        } catch (err: any) {
            setVerificationResult({
                success: false,
                message: err.response?.status === 404
                    ? 'Invalid or fake serial number'
                    : 'Error verifying contract'
            });
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);

    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                base64: true,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
                setLoading(true);

                try {
                    // Send the image to backend for processing
                    const response = await api.post(`${API_URL}/qr/process-image`, {
                        image: `data:image/jpeg;base64,${result.assets[0].base64}`
                    });

                    if (response.data.success) {
                        setVerificationResult({
                            success: true,
                            message: 'Contract Successfully Verified!',
                            contract: response.data.contract
                        });
                        setSerialNumber(response.data.contract.serialNumber);
                        setShowModal(true);
                    }
                } catch (err: any) {
                    setVerificationResult({
                        success: false,
                        message: err.response?.data?.message || 'Error processing QR code'
                    });
                    setShowModal(true);
                } finally {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            setVerificationResult({
                success: false,
                message: 'Error selecting image'
            });
            setShowModal(true);
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.colors.black,
        },
        content: {
            padding: 20,
            paddingBottom: 40,
        },
        title: {
            fontSize: currentTheme.fontSizes.xlarge,
            fontFamily: currentTheme.fonts.bold,
            color: currentTheme.colors.text,
            marginBottom: 30,
            marginTop: 90,
            textAlign: 'left',
        },
        inputContainer: {
            marginBottom: 20,
        },
        label: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
            color: currentTheme.colors.textSecondary,
            marginBottom: 8,
        },
        input: {
            backgroundColor: currentTheme.colors.surface,
            borderRadius: 8,
            padding: 15,
            color: currentTheme.colors.text,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
        },
        verifyButton: {
            backgroundColor: currentTheme.colors.primary,
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
        },
        buttonText: {
            color: currentTheme.colors.white,
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.semibold,
        },
        errorText: {
            color: currentTheme.colors.error,
            marginTop: 10,
            textAlign: 'center',
        },
        resultContainer: {
            marginTop: 30,
            padding: 20,
            backgroundColor: currentTheme.colors.background,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
        },
        resultTitle: {
            fontSize: currentTheme.fontSizes.large,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
            marginBottom: 15,
        },
        resultRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
            flexWrap: 'wrap',
        },
        resultLabel: {
            color: currentTheme.colors.textSecondary,
            fontSize: currentTheme.fontSizes.medium,
        },
        resultValue: {
            color: currentTheme.colors.text,
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
        },
        statusBadge: {
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 15,
            backgroundColor: currentTheme.colors.primary,
        },
        section: {
            marginVertical: 15,
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: currentTheme.colors.border,
        },
        sectionTitle: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.primary,
            marginBottom: 10,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        modalContent: {
            backgroundColor: currentTheme.colors.background,
            borderRadius: 15,
            padding: 20,
            width: '100%',
            maxWidth: 400,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
        },
        modalIcon: {
            alignSelf: 'center',
            marginBottom: 15,
        },
        modalTitle: {
            fontSize: currentTheme.fontSizes.large,
            fontFamily: currentTheme.fonts.bold,
            color: currentTheme.colors.text,
            textAlign: 'center',
            marginBottom: 15,
        },
        modalMessage: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: 20,
        },
        closeButton: {
            backgroundColor: currentTheme.colors.primary,
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
        },
        closeButtonText: {
            color: currentTheme.colors.white,
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.semibold,
        },
        contractDetails: {
            marginTop: 20,
            padding: 15,
            backgroundColor: currentTheme.colors.background,
            borderRadius: 8,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
            flexWrap: 'wrap',
        },
        detailLabel: {
            color: currentTheme.colors.textSecondary,
            fontSize: currentTheme.fontSizes.small,
        },
        detailValue: {
            color: currentTheme.colors.text,
            fontSize: currentTheme.fontSizes.small,
            fontFamily: currentTheme.fonts.medium,
        },
        imagePreview: {
            marginTop: 20,
            padding: 10,
            borderRadius: 8,
            backgroundColor: currentTheme.colors.surface,
            alignItems: 'center',
        },
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'completed':
                return currentTheme.colors.primary;
            case 'pending':
                return currentTheme.colors.secondary;
            case 'terminated':
            case 'rejected':
                return currentTheme.colors.error;
            default:
                return currentTheme.colors.primary;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Contract Verification</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Enter Contract Serial Number</Text>
                    <TextInput
                        style={styles.input}
                        value={serialNumber}
                        onChangeText={setSerialNumber}
                        placeholder="Enter serial number..."
                        placeholderTextColor={currentTheme.colors.textSecondary}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.verifyButton, { marginBottom: 10 }]}
                    onPress={verifyContract}
                    disabled={loading || !serialNumber}
                >
                    {loading ? (
                        <ActivityIndicator color={currentTheme.colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>Verify Contract</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.verifyButton, { backgroundColor: currentTheme.colors.secondary }]}
                    onPress={pickImage}
                >
                    <Text style={styles.buttonText}>Scan QR Code</Text>
                </TouchableOpacity>

                {selectedImage && (
                    <View style={styles.imagePreview}>
                        <Image
                            source={{ uri: selectedImage }}
                            style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 20 }}
                        />
                    </View>
                )}

                <Modal
                    visible={showModal}
                    transparent
                    animationType="fade"
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {verificationResult?.success ? (
                                <>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={60}
                                        color="#22C55E"
                                        style={styles.modalIcon}
                                    />
                                    <Text style={[styles.modalTitle]}>Verification Successful</Text>
                                    <Text style={styles.modalMessage}>
                                        This contract has been verified as authentic
                                    </Text>

                                    {verificationResult.contract && (
                                        <View style={styles.contractDetails}>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>S.N:</Text>
                                                <Text style={styles.detailValue}>
                                                    {verificationResult.contract.serialNumber}
                                                </Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Company:</Text>
                                                <Text style={styles.detailValue}>
                                                    {verificationResult.contract.company.name}
                                                </Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Content Creator:</Text>
                                                <Text style={styles.detailValue}>
                                                    {verificationResult.contract.contentCreator.username}
                                                </Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Status:</Text>
                                                <Text style={[
                                                    styles.detailValue,
                                                    { color: currentTheme.colors.white }
                                                ]}>
                                                    {verificationResult.contract.status}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Ionicons
                                        name="close-circle"
                                        size={60}
                                        color={currentTheme.colors.error}
                                        style={styles.modalIcon}
                                    />
                                    <Text style={styles.modalTitle}>Verification Failed</Text>
                                    <Text style={styles.modalMessage}>
                                        {verificationResult?.message}
                                    </Text>
                                </>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.closeButton,
                                    {
                                        backgroundColor: verificationResult?.success
                                            ? currentTheme.colors.primary
                                            : currentTheme.colors.error
                                    }
                                ]}
                                onPress={closeModal}
                            >
                                <Text style={styles.closeButtonText}>
                                    {verificationResult?.success ? 'View Details' : 'Try Again'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {verificationResult?.success && verificationResult.contract && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>Contract Details</Text>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Serial Number:</Text>
                            <Text style={styles.resultValue}>{verificationResult.contract.serialNumber}</Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Title:</Text>
                            <Text style={styles.resultValue}>{verificationResult.contract.title}</Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Budget:</Text>
                            <Text style={styles.resultValue}>${verificationResult.contract.budget}</Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Rank:</Text>
                            <Text style={styles.resultValue}>{verificationResult.contract.rank}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Company</Text>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Name:</Text>
                                <Text style={styles.resultValue}>
                                    {verificationResult.contract.company.name}
                                    {verificationResult.contract.company.verified &&
                                        <Ionicons name="checkmark-circle" size={16} color={currentTheme.colors.primary} />
                                    }
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Industry:</Text>
                                <Text style={styles.resultValue}>{verificationResult.contract.company.industry}</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Content Creator</Text>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Username:</Text>
                                <Text style={styles.resultValue}>
                                    {verificationResult.contract.contentCreator.username}
                                    {verificationResult.contract.contentCreator.verified &&
                                        <Ionicons name="checkmark-circle" size={16} color={currentTheme.colors.primary} />
                                    }
                                </Text>
                            </View>
                            
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Contract Status:</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(verificationResult.contract.status) }]}>
                                <Text style={[styles.resultValue, { color: currentTheme.colors.white }]}>
                                    {verificationResult.contract.status}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Deal Status:</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(verificationResult.contract.dealStatus) }]}>
                                <Text style={[styles.resultValue, { color: currentTheme.colors.white }]}>
                                    {verificationResult.contract.dealStatus}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Created:</Text>
                            <Text style={styles.resultValue}>
                                {new Date(verificationResult.contract.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default QRCodeVerifier;

