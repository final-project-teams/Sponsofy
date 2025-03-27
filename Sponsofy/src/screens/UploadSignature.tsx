import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    Platform
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const UploadSignature = () => {
    const { currentTheme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { contractId } = route.params as { contractId: string };

    const [signature, setSignature] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.colors.background,
        },
        content: {
            padding: 20,
        },
        header: {
            marginTop: 50,
            marginBottom: 30,
        },
        title: {
            fontSize: currentTheme.fontSizes.xxlarge,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
            marginBottom: 10,
        },
        subtitle: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.textSecondary,
            lineHeight: 24,
        },
        instructionsContainer: {
            backgroundColor: currentTheme.colors.surface,
            borderRadius: currentTheme.borderRadius.large,
            padding: 20,
            marginBottom: 30,
        },
        instructionTitle: {
            fontSize: currentTheme.fontSizes.large,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
            marginBottom: 15,
        },
        instructionItem: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 15,
        },
        instructionNumber: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: currentTheme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
        },
        instructionNumberText: {
            color: currentTheme.colors.white,
            fontSize: currentTheme.fontSizes.small,
            fontFamily: currentTheme.fonts.medium,
        },
        instructionText: {
            flex: 1,
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.text,
            lineHeight: 24,
        },
        uploadContainer: {
            alignItems: 'center',
            marginVertical: 20,
        },
        uploadButton: {
            width: '100%',
            height: 200,
            borderRadius: currentTheme.borderRadius.large,
            borderWidth: 2,
            borderColor: currentTheme.colors.border,
            borderStyle: 'dashed',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: currentTheme.colors.surface,
        },
        uploadIcon: {
            marginBottom: 10,
        },
        uploadText: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
            color: currentTheme.colors.textSecondary,
        },
        previewContainer: {
            width: '100%',
            height: 200,
            borderRadius: currentTheme.borderRadius.large,
            overflow: 'hidden',
            marginBottom: 20,
        },
        previewImage: {
            width: '100%',
            height: '100%',
        },
        submitButton: {
            backgroundColor: currentTheme.colors.primary,
            borderRadius: currentTheme.borderRadius.medium,
            padding: currentTheme.spacing.medium,
            alignItems: 'center',
            marginTop: 20,
        },
        submitButtonText: {
            color: currentTheme.colors.white,
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
        },
        backButton: {
            position: 'absolute',
            top: 50,
            left: 20,
            zIndex: 1,
        },
    });

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Sorry, we need camera roll permissions to upload your signature.'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSignature(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!signature) {
            Alert.alert('Error', 'Please select a signature image first');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('signature', {
                uri: signature,
                type: 'image/jpeg',
                name: 'signature.jpg',
            } as any);
            formData.append('contractId', contractId);

            const response = await api.post('/signature', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Alert.alert(
                    'Success',
                    'Signature uploaded successfully',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Error uploading signature:', error);
            Alert.alert(
                'Error',
                'Failed to upload signature. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={currentTheme.colors.text} />
            </TouchableOpacity>

            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Upload Signature</Text>
                    <Text style={styles.subtitle}>
                        Please provide a clear image of your signature to complete the contract
                    </Text>
                </View>

                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionTitle}>Instructions</Text>

                    <View style={styles.instructionItem}>
                        <View style={styles.instructionNumber}>
                            <Text style={styles.instructionNumberText}>1</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Sign your name clearly on a white piece of paper
                        </Text>
                    </View>

                    <View style={styles.instructionItem}>
                        <View style={styles.instructionNumber}>
                            <Text style={styles.instructionNumberText}>2</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Ensure good lighting and take a clear photo
                        </Text>
                    </View>

                    <View style={styles.instructionItem}>
                        <View style={styles.instructionNumber}>
                            <Text style={styles.instructionNumberText}>3</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Make sure the signature is centered and visible
                        </Text>
                    </View>
                </View>

                <View style={styles.uploadContainer}>
                    {signature ? (
                        <View style={styles.previewContainer}>
                            <Image
                                source={{ uri: signature }}
                                style={styles.previewImage}
                                resizeMode="contain"
                            />
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={pickImage}
                        >
                            <Ionicons
                                name="cloud-upload-outline"
                                size={48}
                                color={currentTheme.colors.textSecondary}
                                style={styles.uploadIcon}
                            />
                            <Text style={styles.uploadText}>Tap to upload signature</Text>
                        </TouchableOpacity>
                    )}

                    {signature && (
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={currentTheme.colors.white} />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Signature</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default UploadSignature;
