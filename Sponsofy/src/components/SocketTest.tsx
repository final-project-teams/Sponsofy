import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSocket } from '../context/socketContext';

const SocketTest = () => {
    const { chatSocket, socketConnected, reconnectSocket } = useSocket();
    const [logs, setLogs] = useState<string[]>([]);

    // Add a log message
    const addLog = (message: string) => {
        const timestamp = new Date().toISOString().substr(11, 8); // HH:MM:SS
        const logMessage = `[${timestamp}] ${message}`;
        setLogs(prev => [logMessage, ...prev].slice(0, 20)); // Keep last 20 logs
    };

    // Test socket connection
    const testConnection = () => {
        addLog('Testing socket connection...');

        if (!chatSocket) {
            addLog('Chat socket is not available');
            return;
        }

        try {
            addLog(`Socket connected: ${socketConnected}`);
            addLog(`Socket ID: ${chatSocket.id || 'none'}`);

            // Send a ping event
            chatSocket.emit('ping', { time: new Date().toISOString() });
            addLog('Sent ping event');
        } catch (error) {
            addLog(`Error: ${error}`);
        }
    };

    // Set up event listeners
    useEffect(() => {
        addLog('SocketTest component mounted');

        if (!chatSocket) {
            addLog('Chat socket is not available');
            return;
        }

        // Listen for pong events
        const handlePong = (data: any) => {
            addLog(`Received pong: ${JSON.stringify(data)}`);
        };

        // Listen for connection events
        const handleConnect = () => {
            addLog(`Socket connected with ID: ${chatSocket.id}`);
        };

        const handleDisconnect = (reason: string) => {
            addLog(`Socket disconnected: ${reason}`);
        };

        const handleError = (error: any) => {
            addLog(`Connection error: ${error.message}`);
        };

        // Add listeners
        chatSocket.on('pong', handlePong);
        chatSocket.on('connect', handleConnect);
        chatSocket.on('disconnect', handleDisconnect);
        chatSocket.on('connect_error', handleError);

        // Clean up on unmount
        return () => {
            chatSocket.off('pong', handlePong);
            chatSocket.off('connect', handleConnect);
            chatSocket.off('disconnect', handleDisconnect);
            chatSocket.off('connect_error', handleError);
        };
    }, [chatSocket]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Socket Test</Text>

            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={[
                    styles.statusValue,
                    socketConnected ? styles.connected : styles.disconnected
                ]}>
                    {socketConnected ? 'Connected' : 'Disconnected'}
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={testConnection}
                >
                    <Text style={styles.buttonText}>Test Connection</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={reconnectSocket}
                >
                    <Text style={styles.buttonText}>Reconnect</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.logsTitle}>Logs:</Text>
            <ScrollView style={styles.logs}>
                {logs.map((log, index) => (
                    <Text key={index} style={styles.logText}>{log}</Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 4,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    connected: {
        color: 'green',
    },
    disconnected: {
        color: 'red',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 4,
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    logsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    logs: {
        height: 200,
        backgroundColor: '#333',
        padding: 8,
        borderRadius: 4,
    },
    logText: {
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 12,
        marginBottom: 2,
    },
});

export default SocketTest; 