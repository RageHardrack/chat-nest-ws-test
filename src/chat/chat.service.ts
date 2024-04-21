import { Injectable } from '@nestjs/common';

interface Client {
  id: string;
  name: string;
}

@Injectable()
export class ChatService {
  private clients: Record<string, Client> = {};

  onClientConnected(client: Client) {
    this.clients[client.id] = client;
  }

  onClientDisconnected(clientId: string) {
    delete this.clients[clientId];
  }

  getClients() {
    return Object.values(this.clients);
  }
}
