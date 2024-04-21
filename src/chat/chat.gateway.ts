import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly chatService: ChatService) {}

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      const { name, token } = socket.handshake.auth;

      console.log({ name, token });

      if (!name) {
        socket.disconnect();
        return;
      }

      // Agregar cliente a la lista de clientes
      this.chatService.onClientConnected({ id: socket.id, name });

      // Mensaje de bienvenida
      socket.emit('welcome-message', 'Bienvenido al Servidor');

      // Listado de clientes conectados
      this.server.emit('on-clients-changed', this.chatService.getClients());

      socket.on('disconnect', () => {
        this.chatService.onClientDisconnected(socket.id);
        this.server.emit('on-clients-changed', this.chatService.getClients());
        console.log({ check: `Cliente desconectado: ${socket.id}` });
      });
    });
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    const { name } = client.handshake.auth;

    if (!message) {
      return;
    }

    this.server.emit('on-message', {
      userId: client.id,
      message,
      name,
    });
  }
}
