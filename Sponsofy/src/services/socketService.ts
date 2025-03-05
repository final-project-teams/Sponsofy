import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

class SocketService {
  private socket: typeof Socket | null = null;

  connect(token: string) {
    this.socket = io('http://localhost:3000', {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
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