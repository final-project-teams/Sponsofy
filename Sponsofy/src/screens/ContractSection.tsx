import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { jwtDecode } from 'jwt-decode'; 
import socket from '../services/socketService'; 
import { getContractbyCompanyId, acceptContract } from '../services/api'; 

// Define the JWT payload type
interface CustomJwtPayload {
    userId: number;
    role: string;
    iat: number;
    exp: number;
}


const ContractSection = ({ userRole, token }) => {
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [decodedUserId, setDecodedUserId] = useState<number | null>(null);
    const [companyId, setCompanyId] = useState<number | null>(null);

    // Decode the token and extract userId
    useEffect(() => {
        try {
            if (token) {
                const decodedToken = jwtDecode<CustomJwtPayload>(token);
                console.log('Decoded token:', decodedToken);
                console.log('Decoded token userId:', decodedToken.userId);

                setDecodedUserId(decodedToken.userId);
                if (userRole === 'company') {
                    setCompanyId(decodedToken.userId); // Only set companyId if user is a company
                }
                
                console.log('Company ID:', companyId);
                console.log('Decoded token userId:', decodedToken.userId);

            }
        } catch (err) {
            setError('Invalid token');
        }
    }, [token, userRole]); // Rerun when token or userRole changes

    useEffect(() => {
        let isMounted = true;

        const fetchContract = async () => {
            if (!companyId) {
                setLoading(false);
                setError('Company ID is required');
                return;
            }

            try {
                console.log('Fetching contract for companyId:', companyId);
                const response = await getContractbyCompanyId(companyId);
                console.log('Contract response:', response);
                if (isMounted) {
                    setContract(response.data);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Error fetching contract');
                    setLoading(false);
                }
            }
        };

        if (companyId) fetchContract(); // Fetch contract only if companyId exists

        socket.on('contract_updated', (updatedContract) => {
            if (isMounted) setContract(updatedContract);
        });

        return () => {
            isMounted = false;
            socket.off('contract_updated');
        };
    }, [companyId]); // Only run when companyId is updated

    const handleAcceptContract = async () => {
        try {
            if (!contract || !contract.id) {
                throw new Error('Contract ID is missing');
            }

            await acceptContract(contract.id, decodedUserId);
            Alert.alert('Success', 'Contract accepted successfully!');

            // Emit a socket event for contract acceptance
            socket.emit('contract_accepted', { contractId: contract.id, userId: decodedUserId });

            setContract({ ...contract, accepted: true });
        } catch (err) {
            Alert.alert('Error', 'Error accepting contract');
        }
    };

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Contract Details</Text>
            {contract ? (
                <>
                    <Text><Text style={styles.label}>Title:</Text> {contract.title}</Text>
                    <Text><Text style={styles.label}>Description:</Text> {contract.description}</Text>
                    <Text><Text style={styles.label}>Start Date:</Text> {new Date(contract.start_date).toLocaleDateString()}</Text>
                    <Text><Text style={styles.label}>End Date:</Text> {new Date(contract.end_date).toLocaleDateString()}</Text>
                    <Text><Text style={styles.label}>Status:</Text> {contract.status}</Text>
                    <Text><Text style={styles.label}>Rank:</Text> {contract.rank}</Text>
                    <Text><Text style={styles.label}>Payment Terms:</Text> {contract.payment_terms}</Text>

                    {userRole === 'influencer' && !contract?.accepted && (
                        <Button title="Accept Contract" onPress={handleAcceptContract} />
                    )}

                    {contract?.accepted && <Text style={styles.accepted}>You have accepted this contract.</Text>}
                </>
            ) : (
                <Text>No contract found.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        margin: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    label: {
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        textAlign: 'center',
    },
    accepted: {
        color: 'green',
        marginTop: 10,
    },
});

export default ContractSection;
