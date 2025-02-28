import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

class SocketService {
  private socket: typeof Socket | null = null;
  private serverUrl = 'http://192.168.11.93:3304'; // Update with your server IP
  private userId: string | null = null;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private onIceCandidateCallback: ((candidate: any) => void) | null = null;
  private onOfferCallback: ((offer: any) => void) | null = null;
  private onAnswerCallback: ((answer: any) => void) | null = null;

  // Add method to check if socket is connected
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  // Add method to get userId
  getUserId(): string | null {
    return this.userId;
  }

  connect(userId: string) {
    this.userId = userId;
    
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      return;
    }

    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.log('Max connection attempts reached, not trying again');
      return;
    }

    this.connectionAttempts++;
    
    try {
      console.log(`Attempting to connect to socket server (attempt ${this.connectionAttempts})`);
      
      // Create socket with error handling
      this.socket = io(this.serverUrl, {
        auth: {
          userId
        },
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 20000,
        query: { userId }
      });

      this.socket.on('connect', () => {
        console.log('Connected to socket server with ID:', userId);
        this.connectionAttempts = 0;
        
        // Set up WebRTC signaling events
        this.setupSignalingEvents();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        
        if (this.socket && this.socket.io.opts.transports[0] === 'websocket') {
          console.log('Websocket transport failed, falling back to polling');
          this.socket.io.opts.transports = ['polling'];
        }
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
      
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    } catch (error) {
      console.error('Error creating socket connection:', error);
    }
  }

  private setupSignalingEvents() {
    if (!this.socket) return;

    // Handle incoming ICE candidates
    this.socket.on('ice-candidate', (data) => {
      console.log('Received ICE candidate:', data);
      if (this.onIceCandidateCallback) {
        this.onIceCandidateCallback(data.candidate);
      }
    });

    // Handle incoming offers
    this.socket.on('offer', (data) => {
      console.log('Received offer:', data);
      if (this.onOfferCallback) {
        this.onOfferCallback(data.offer);
      }
    });

    // Handle incoming answers
    this.socket.on('answer', (data) => {
      console.log('Received answer:', data);
      if (this.onAnswerCallback) {
        this.onAnswerCallback(data.answer);
      }
    });
  }

  // WebRTC signaling methods
  sendIceCandidate(roomId: string, candidate: any) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected when trying to send ICE candidate');
      return;
    }
    
    this.socket.emit('ice-candidate', {
      roomId,
      userId: this.userId,
      candidate
    });
  }

  sendOffer(roomId: string, offer: any) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected when trying to send offer');
      return;
    }
    
    this.socket.emit('offer', {
      roomId,
      userId: this.userId,
      offer
    });
  }

  sendAnswer(roomId: string, answer: any) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected when trying to send answer');
      return;
    }
    
    this.socket.emit('answer', {
      roomId,
      userId: this.userId,
      answer
    });
  }

  // Event listeners
  onIceCandidate(callback: (candidate: any) => void) {
    this.onIceCandidateCallback = callback;
  }

  onOffer(callback: (offer: any) => void) {
    this.onOfferCallback = callback;
  }

  onAnswer(callback: (answer: any) => void) {
    this.onAnswerCallback = callback;
  }

  // Existing methods
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  joinRoom(roomId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected when trying to join room');
      return;
    }
    
    console.log('Joining room:', roomId);
    this.socket.emit('join-room', { roomId, userId: this.userId });
  }

  leaveRoom(roomId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected when trying to leave room');
      return;
    }
    
    console.log('Leaving room:', roomId);
    this.socket.emit('leave-room', { roomId, userId: this.userId });
  }

  sendMessage(roomId: string, message: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected when trying to send message');
      return;
    }
    
    this.socket.emit('send-message', { roomId, userId: this.userId, message });
  }

  onMessage(callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized when setting up message listener');
      return;
    }
    
    this.socket.on('receive-message', callback);
  }

  onUserJoined(callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized when setting up user joined listener');
      return;
    }
    
    this.socket.on('user-joined', callback);
  }

  onUserLeft(callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized when setting up user left listener');
      return;
    }
    
    this.socket.on('user-left', callback);
  }

  // Call management methods
  initiateCall(data: { callerId: string; calleeId: string; roomId: string; callType: 'video' | 'audio' }) {
    if (this.socket) {
      console.log('Initiating call to:', data.calleeId);
      this.socket.emit('initiate_call', data);
    }
  }

  acceptCall(data: { callerId: string; calleeId: string; roomId: string }) {
    if (this.socket) {
      console.log('Accepting call from:', data.callerId);
      this.socket.emit('accept_call', data);
    }
  }

  rejectCall(data: { callerId: string; calleeId: string; reason?: string }) {
    if (this.socket) {
      console.log('Rejecting call from:', data.callerId);
      this.socket.emit('reject_call', data);
    }
  }

  endCall(data: { roomId: string; userId: string }) {
    if (this.socket) {
      console.log('Ending call in room:', data.roomId);
      this.socket.emit('end_call', data);
    }
  }

  // Call event listeners
  onIncomingCall(callback: (data: { callerId: string; roomId: string; callType: 'video' | 'audio' }) => void) {
    if (this.socket) {
      this.socket.on('incoming_call', callback);
    }
  }

  onIncomingCallDetails(callback: (data: { 
    callerId: string; 
    callerName: string; 
    callerAvatar?: string;
    roomId: string; 
    callType: 'video' | 'audio' 
  }) => void) {
    if (this.socket) {
      this.socket.on('incoming_call_details', callback);
    }
  }

  onCallAccepted(callback: (data: { roomId: string }) => void) {
    if (this.socket) {
      this.socket.on('call_accepted', callback);
    }
  }

  onCallRejected(callback: (data: { reason?: string }) => void) {
    if (this.socket) {
      this.socket.on('call_rejected', callback);
    }
  }

  onCallEnded(callback: (data: { roomId: string; endedBy: string }) => void) {
    if (this.socket) {
      this.socket.on('call_ended', callback);
    }
  }

  // User status methods
  updateUserStatus(status: 'online' | 'offline' | 'busy' | 'away') {
    if (this.socket) {
      this.socket.emit('update_status', { userId: this.userId, status });
    }
  }

  onUserStatusChanged(callback: (data: { userId: string; status: string }) => void) {
    if (this.socket) {
      this.socket.on('user_status_changed', callback);
    }
  }

  // Remove specific listener
  removeListener(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  onReceiveMessage(callback: (message: any) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized when setting up message listener');
      return;
    }
    
    this.socket.on('receive-message', callback);
  }
}

export const socketService = new SocketService();