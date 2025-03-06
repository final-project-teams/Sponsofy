import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

class SocketService {
  private socket: typeof Socket | null = null;
  private serverUrl = 'http://192.168.110.131:3304'; // Updated to match current network configuration
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
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  sendMessage(data: { roomId: string; message: string; userId: string }) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  onReceiveMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  emitTyping(data: { roomId: string; username: string }) {
    if (this.socket) {
      this.socket.emit('typing', data);
    }
  }

  onUserTyping(callback: (data: { username: string }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  onNewTerm(callback: (term: any) => void) {
    if (this.socket) {
      this.socket.on('newTerm', callback);
    }
  }
  onTermConfirmed(callback: (term: any) => void) {
    if (this.socket) {
      this.socket.on('termConfirmed', callback);
    }
  }
  onTermUpdated(callback: (term: any) => void) {
    if (this.socket) {
      this.socket.on('termUpdated', callback);
    }
  }
  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }
  onTermRejected(callback: (term: any) => void) {
    if (this.socket) {
      this.socket.on('termRejected', callback);
    }
  }
  onTermAccepted(callback: (term: any) => void) {
    if (this.socket) {
      this.socket.on('termAccepted', callback);
    }
  }
  onTermNegotiating(callback: (term: any) => void) {
    if (this.socket) {
      this.socket.on('termNegotiating', callback);
    }
  }
  
  

}

export const socketService = new SocketService();