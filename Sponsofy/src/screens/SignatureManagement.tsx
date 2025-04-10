import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    FlatList,
    Dimensions
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/axios';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config/source';

interface Signature {
    id: number;
    signature_data: string;
    created_at: string;
}

const SignatureManagement = () => {
    const { currentTheme } = useTheme();
    const navigation = useNavigation();
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.colors.background,
        },
        header: {
            padding: 20,
            paddingTop: 60,
            backgroundColor: currentTheme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.colors.border,
        },
        title: {
            fontSize: currentTheme.fontSizes.xxlarge,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
        },
        subtitle: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.textSecondary,
            marginTop: 5,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        uploadButton: {
            backgroundColor: currentTheme.colors.primary,
            borderRadius: currentTheme.borderRadius.medium,
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
        },
        uploadButtonText: {
            color: currentTheme.colors.white,
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.medium,
            marginLeft: 10,
        },
        signatureCard: {
            backgroundColor: currentTheme.colors.surface,
            borderRadius: currentTheme.borderRadius.large,
            padding: 15,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
        },
        signatureImage: {
            width: '100%',
            height: 200,
            borderRadius: currentTheme.borderRadius.medium,
            marginBottom: 10,
        },
        dateText: {
            fontSize: currentTheme.fontSizes.small,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.textSecondary,
        },
        deleteButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: currentTheme.colors.error,
            borderRadius: 20,
            padding: 8,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 40,
        },
        emptyText: {
            fontSize: currentTheme.fontSizes.medium,
            fontFamily: currentTheme.fonts.regular,
            color: currentTheme.colors.textSecondary,
            textAlign: 'center',
            marginTop: 10,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        sectionTitle: {
            fontSize: currentTheme.fontSizes.large,
            fontFamily: currentTheme.fonts.semibold,
            color: currentTheme.colors.text,
            marginBottom: 15,
            marginTop: 20,
        },
        currentSignatureCard: {
            backgroundColor: currentTheme.colors.surface,
            borderRadius: currentTheme.borderRadius.large,
            padding: 20,
            marginBottom: 25,
            borderWidth: 1,
            borderColor: currentTheme.colors.primary,
            shadowColor: currentTheme.colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        currentSignatureImage: {
            width: '100%',
            height: 250,
            borderRadius: currentTheme.borderRadius.medium,
            marginBottom: 15,
        },
        historicalSignatureImage: {
            width: '100%',
            height: 180,
            borderRadius: currentTheme.borderRadius.medium,
            marginBottom: 10,
        },
        currentLabel: {
            backgroundColor: currentTheme.colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            position: 'absolute',
            top: -12,
            right: 20,
            zIndex: 1,
        },
        currentLabelText: {
            color: currentTheme.colors.white,
            fontSize: currentTheme.fontSizes.small,
            fontFamily: currentTheme.fonts.medium,
        },
        divider: {
            height: 1,
            backgroundColor: currentTheme.colors.border,
            marginVertical: 20,
        },
    });

    const fetchSignatures = async () => {
        try {
            setLoading(true);
            const response = await api.get('/signature/user');
            if (response.data.success) {
                setSignatures(response.data.signatures);
            }
        } catch (error) {
            console.error('Error fetching signatures:', error);
            Alert.alert('Error', 'Failed to load signatures');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSignatures();
    }, []);

    const handleUpload = async () => {
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
            try {
                setUploading(true);
                const formData = new FormData();
                formData.append('signature', {
                    uri: result.assets[0].uri,
                    type: 'image/jpeg',
                    name: 'signature.jpg',
                } as any);

                const response = await api.post('/signature', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.success) {
                    fetchSignatures();
                    Alert.alert('Success', 'Signature uploaded successfully');
                }
            } catch (error) {
                console.error('Error uploading signature:', error);
                Alert.alert('Error', 'Failed to upload signature');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert(
            'Delete Signature',
            'Are you sure you want to delete this signature?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await api.delete(`/signature/${id}`);
                            if (response.data.success) {
                                setSignatures(signatures.filter(sig => sig.id !== id));
                                Alert.alert('Success', 'Signature deleted successfully');
                            }
                        } catch (error) {
                            console.error('Error deleting signature:', error);
                            Alert.alert('Error', 'Failed to delete signature');
                        }
                    },
                },
            ]
        );
    };

    const renderSignature = ({ item, index }: { item: Signature; index: number }) => {
        if (index === 0) {
            return (
                <>
                    <Text style={styles.sectionTitle}>Current Signature</Text>
                    <View style={styles.currentSignatureCard}>
                        <Image
                            source={{ uri: `${API_URL}/uploads/signatures/${item.signature_data.split('/').pop()}` }}
                            style={styles.currentSignatureImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.dateText}>
                            Created: {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(item.id)}
                        >
                            <Ionicons name="trash-outline" size={20} color={currentTheme.colors.white} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Signature History</Text>
                </>
            );
        }

        return (
            <View style={styles.signatureCard}>
                <Image
                    source={{ uri: `${API_URL}/uploads/signatures/${item.signature_data.split('/').pop()}` }}
                    style={styles.historicalSignatureImage}
                    resizeMode="contain"
                />
                <Text style={styles.dateText}>
                    Created: {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash-outline" size={20} color={currentTheme.colors.white} />
                </TouchableOpacity>
            </View>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="document-text-outline"
                size={48}
                color={currentTheme.colors.textSecondary}
            />
            <Text style={styles.emptyText}>
                No signatures yet.{'\n'}Upload your first signature!
            </Text>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={currentTheme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Signatures</Text>
                <Text style={styles.subtitle}>
                    Manage your digital signatures
                </Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator color={currentTheme.colors.white} />
                    ) : (
                        <>
                            <Ionicons name="add-circle-outline" size={24} color={currentTheme.colors.white} />
                            <Text style={styles.uploadButtonText}>Upload New Signature</Text>
                        </>
                    )}
                </TouchableOpacity>

                <FlatList
                    data={signatures}
                    renderItem={renderSignature}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={EmptyState}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        fetchSignatures();
                    }}
                />
            </View>
        </View>
    );
};

export default SignatureManagement; 