import io from 'socket.io-client';
import {SOCKET_URL} from './source'
if(!SOCKET_URL){
  throw new Error("SOCKET_URL is not defined")
}
export const socketChat = io(`${SOCKET_URL}/chat`)
export const socketNotification = io(`${SOCKET_URL}/notification`)