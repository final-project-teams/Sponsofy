import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { socketChat, socketNotification } from '../config/socket';
import { useSocket } from '../context/socketContext';

const SocketDebugger = () => {
    const { socketConnected, reconnectSocket } = useSocket();
    const [logs, setLogs] = useState<string[]>([]);
    const [chatSocketInfo, setChatSocketInfo] = useState({
        id: null as string | null,
        connected: false
    });
    const [notificationSocketInfo, setNotificationSocketInfo] = useState({
        id: null as string | null,
        connected: false
    });

    // Add a log message
    const addLog = (message: string) => {
        const timestamp = new Date().toISOString().substr(11, 8); // HH:MM:SS
        const logMessage = `[${timestamp}] ${message}`;
        setLogs(prev => [logMessage, ...prev].slice(0, 50)); // Keep last 50 logs
    };

    // Update socket info
    const updateSocketInfo = () => {
        try {
            setChatSocketInfo({
                id: socketChat.id,
                connected: socketChat.connected
            });

            setNotificationSocketInfo({
                id: socketNotification.id,
                connected: socketNotification.connected
            });

            addLog(`Socket info updated - Chat: ${socketChat.connected ? 'connected' : 'disconnected'}, Notification: ${socketNotification.connected ? 'connected' : 'disconnected'}`);
        } catch (error) {
            addLog(`Error updating socket info: ${error}`);
        }
    };

    // Test socket connection
    const testConnection = () => {
        addLog('Testing socket connection...');

        try {
            // Test chat socket
            addLog(`Chat socket - ID: ${socketChat.id}, Connected: ${socketChat.connected}`);
            if (!socketChat.connected) {
                addLog('Attempting to connect chat socket...');
                socketChat.connect();
            }

            // Test notification socket
            addLog(`Notification socket - ID: ${socketNotification.id}, Connected: ${socketNotification.connected}`);
            if (!socketNotification.connected) {
                addLog('Attempting to connect notification socket...');
                socketNotification.connect();
            }
        } catch (error) {
            addLog(`Error testing connection: ${error}`);
        }

        // Update info after a short delay
        setTimeout(updateSocketInfo, 1000);
    };

    // Set up event listeners
    useEffect(() => {
        addLog('SocketDebugger mounted');
        updateSocketInfo();

        // Set up event listeners for chat socket
        try {
            socketChat.on('connect', () => {
                addLog(`Chat socket connected: ${socketChat.id}`);
                updateSocketInfo();
            });

            socketChat.on('disconnect', (reason) => {
                addLog(`Chat socket disconnected: ${reason}`);
                updateSocketInfo();
            });

            socketChat.on('connect_error', (error) => {
                addLog(`Chat socket connection error: ${error.message}`);
                updateSocketInfo();
            });
        } catch (error) {
            addLog(`Error setting up chat socket listeners: ${error}`);
        }

        // Set up event listeners for notification socket
        try {
            socketNotification.on('connect', () => {
                addLog(`Notification socket connected: ${socketNotification.id}`);
                updateSocketInfo();
            });

            socketNotification.on('disconnect', (reason) => {
                addLog(`Notification socket disconnected: ${reason}`);
                updateSocketInfo();
            });

            socketNotification.on('connect_error', (error) => {
                addLog(`Notification socket connection error: ${error.message}`);
                updateSocketInfo();
            });
        } catch (error) {
            addLog(`Error setting up notification socket listeners: ${error}`);
        }

        // Clean up on unmount
        return () => {
            addLog('SocketDebugger unmounting');

            try {
                socketChat.off('connect');
                socketChat.off('disconnect');
                socketChat.off('connect_error');

                socketNotification.off('connect');
                socketNotification.off('disconnect');
                socketNotification.off('connect_error');
            } catch (error) {
                addLog(`Error cleaning up socket listeners: ${error}`);
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Socket Debugger</Text>

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Chat Socket:</Text>
                <Text style={styles.infoText}>
                    ID: {chatSocketInfo.id || 'Not connected'}
                </Text>
                <Text style={[
                    styles.statusText,
                    chatSocketInfo.connected ? styles.connected : styles.disconnected
                ]}>
                    {chatSocketInfo.connected ? 'Connected' : 'Disconnected'}
                </Text>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Notification Socket:</Text>
                <Text style={styles.infoText}>
                    ID: {notificationSocketInfo.id || 'Not connected'}
                </Text>
                <Text style={[
                    styles.statusText,
                    notificationSocketInfo.connected ? styles.connected : styles.disconnected
                ]}>
                    {notificationSocketInfo.connected ? 'Connected' : 'Disconnected'}
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
                    onPress={() => {
                        addLog('Reconnecting sockets...');
                        reconnectSocket();
                        setTimeout(updateSocketInfo, 2000);
                    }}
                >
                    <Text style={styles.buttonText}>Reconnect</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={updateSocketInfo}
                >
                    <Text style={styles.buttonText}>Refresh Info</Text>
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
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    infoContainer: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
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
        flex: 1,
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

export default SocketDebugger; 