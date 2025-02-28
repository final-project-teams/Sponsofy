import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { socketService } from '../services/socketService';
import { Audio } from 'expo-av';

// Define the navigation type
type RootStackParamList = {
  Companies: undefined;
  VideoCall: { roomId?: string; remoteUserId?: string; isIncoming?: boolean };
};

type VideoCallScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Define the expected route parameters
type VideoCallRouteParams = {
  roomId?: string;
  remoteUserId?: string;
  isIncoming?: boolean;
};

type VideoCallScreenRouteProp = RouteProp<{ VideoCall: VideoCallRouteParams }, 'VideoCall'>;

const VideoCallScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<VideoCallScreenNavigationProp>();
  const route = useRoute<VideoCallScreenRouteProp>();
  
  // Use default values if params are undefined
  const roomId = route.params?.roomId || 'default-room';
  const remoteUserId = route.params?.remoteUserId || 'unknown-user';
  const isIncoming = route.params?.isIncoming || false;
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callTimer, setCallTimer] = useState('00:00:00');
  const [callActive, setCallActive] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<Date | null>(null);

  const startTimer = () => {
    startTime.current = new Date();
    timerRef.current = setInterval(() => {
      if (startTime.current) {
        const now = new Date();
        const diff = now.getTime() - startTime.current.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCallTimer(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);
  };

  useEffect(() => {
    const initializeCall = async () => {
      try {
        console.log('Initializing call with roomId:', roomId, 'remoteUserId:', remoteUserId);
        
        // Request audio permissions
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Audio permission is required for calls');
          handleEndCall();
          return;
        }

        // Connect with a default user ID if not already connected
        if (!socketService.isConnected()) {
          const userId = 'user-' + Math.floor(Math.random() * 10000);
          console.log('Connecting to socket with userId:', userId);
          socketService.connect(userId);
          
          // Give some time for the socket to connect
          setTimeout(() => {
            if (socketService.isConnected()) {
              console.log('Socket connected, joining room');
              socketService.joinRoom(roomId);
              setCallActive(true);
              
              // Simulate call connecting after a delay
              setTimeout(() => {
                setCallConnected(true);
                startTimer();
              }, 2000);
            } else {
              console.log('Socket failed to connect');
              Alert.alert(
                'Connection Error',
                'Could not connect to the call service. Please try again later.',
                [{ text: 'OK', onPress: () => handleEndCall() }]
              );
            }
          }, 2000);
        } else {
          console.log('Socket already connected, joining room');
          socketService.joinRoom(roomId);
          setCallActive(true);
          
          // Simulate call connecting after a delay
          setTimeout(() => {
            setCallConnected(true);
            startTimer();
          }, 2000);
        }
      } catch (error) {
        console.error('Error initializing call:', error);
        Alert.alert(
          'Error',
          'Failed to initialize call. Please try again.',
          [{ text: 'OK', onPress: () => handleEndCall() }]
        );
      }
    };

    initializeCall();

    // Cleanup function
    return () => {
      if (socketService.isConnected()) {
        socketService.leaveRoom(roomId);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [roomId, remoteUserId]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  const handleEndCall = () => {
    // Clean up resources
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (socketService.isConnected()) {
      socketService.leaveRoom(roomId);
    }
    
    // Navigate back
    navigation.navigate('Companies');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.callerInfo}>
          <Text style={[styles.callerName, { color: colors.text }]}>
            {remoteUserId}
          </Text>
          <Text style={[styles.callStatus, { color: colors.text }]}>
            {callConnected ? callTimer : isIncoming ? 'Incoming call...' : 'Calling...'}
          </Text>
        </View>
      </View>

      <View style={styles.videoContainer}>
        {!isVideoOff ? (
          <View 
            style={[
              styles.remoteVideo, 
              { 
                backgroundColor: colors.card,
                justifyContent: 'center',
                alignItems: 'center'
              }
            ]}
          >
            <Icon name="person" size={100} color={colors.text} />
            <Text style={{ color: colors.text, marginTop: 10, fontSize: 18 }}>
              {callConnected ? 'Video Call Connected' : 'Connecting...'}
            </Text>
          </View>
        ) : (
          <View style={[styles.videoOffContainer, { backgroundColor: colors.card }]}>
            <Icon name="videocam-off" size={50} color={colors.text} />
            <Text style={[styles.videoOffText, { color: colors.text }]}>
              Video Off
            </Text>
          </View>
        )}
        
        {isMuted && (
          <View style={styles.micOffIndicator}>
            <Icon name="mic-off" size={16} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, { 
            backgroundColor: isVideoOff ? '#FF9500' : colors.card 
          }]}
          onPress={toggleVideo}
        >
          <Icon name={isVideoOff ? "videocam" : "videocam-off"} size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: '#FF3B30' }]}
          onPress={handleEndCall}
        >
          <Icon name="call" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlButton, { 
            backgroundColor: isMuted ? '#FF9500' : colors.card 
          }]}
          onPress={toggleMute}
        >
          <Icon name={isMuted ? "mic" : "mic-off"} size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card }]}>
          <Icon name="chatbubble" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card }]}>
          <Icon name="information-circle" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  callerInfo: {
    alignItems: 'center',
  },
  callerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  callStatus: {
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  videoOffContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '500',
  },
  micOffIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 5,
    borderRadius: 15,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoCallScreen;