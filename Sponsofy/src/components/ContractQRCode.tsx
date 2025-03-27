// src/components/ContractQRCode.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface ContractQRCodeProps {
    contractData: {
        id: number;
        title: string;
        serialNumber: string;
        createdAt: string;
    };
}

const ContractQRCode = ({ contractData }: ContractQRCodeProps) => {
    // Create a string representation of data to encode in QR code
    const qrValue = JSON.stringify({
        id: contractData.id,
        serialNumber: contractData.serialNumber,
        title: contractData.title,
        createdAt: contractData.createdAt
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{contractData.title}</Text>
            <Text style={styles.serialNumber}>SN: {contractData.serialNumber}</Text>

            <View style={styles.qrContainer}>
                <QRCode
                    value={qrValue}
                    size={200}
                    backgroundColor="white"
                    color="black"
                />
            </View>

            <Text style={styles.instructions}>
                Scan this QR code to verify the contract details
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        margin: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    serialNumber: {
        fontSize: 16,
        marginBottom: 20,
        color: '#555',
    },
    qrContainer: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 20,
    },
    instructions: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
    },
});

export default ContractQRCode;