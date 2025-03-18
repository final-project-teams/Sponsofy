import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface ContractQRCodeProps {
    qrCodeData: string;
    size?: number;
}

const ContractQRCode: React.FC<ContractQRCodeProps> = ({ qrCodeData, size = 200 }) => {
    return (
        <View style={styles.container}>
            <QRCode
                value={qrCodeData}
                size={size}
                backgroundColor="white"
                color="black"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
});

export default ContractQRCode;