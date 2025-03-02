export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
  }
  
  export interface Message {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    timestamp: string;
    attachments?: Attachment[];
  }
  
  export interface Attachment {
    id: string;
    type: 'image' | 'video' | 'document';
    url: string;
    name: string;
  }
  
  export interface User {
    id: string;
    username: string;
    avatar?: string;
  }