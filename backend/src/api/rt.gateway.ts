import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventEmitter } from 'events';
import { OnEvent } from '@nestjs/event-emitter';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class rtGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private userConnections = new Map<string, Set<string>>();
  private emitter: EventEmitter = new EventEmitter();

  @WebSocketServer()
  server: Server;

  @OnEvent('event.created')
  handleOrderCreatedEvent(payload: any) {
    // const client = this.userConnections.get(payload.tenantID);
    // client.emit('receiveEvent', `Received your message:`);

    const tenantID = payload.tenantID;
    if (this.userConnections.has(tenantID)) {
      this.userConnections.get(tenantID).forEach((socketID) => {
        this.server.to(socketID).emit('event.created');
      });
    }
  }

  handleConnection(@ConnectedSocket() client: any) {
    const query = client.handshake.query;
    const token = query.token;
    if (!token) {
      client.disconnect();
      return;
    }
    const decoded: any = jwt.verify(token, 'SECRET_KEYS');

    const tenantID = decoded.tenantID;

    if (!this.userConnections.has(tenantID)) {
      this.userConnections.set(tenantID, new Set());
    }
    this.userConnections.get(tenantID).add(client.id);
    console.log(`Client connected: ${tenantID}-${client.id}`);
    // this.clients.set(tenantID, client);
  }

  handleDisconnect(@ConnectedSocket() client: any) {
    const query = client.handshake.query;
    const token = query.token;
    const decoded: any = jwt.verify(token, 'SECRET_KEYS');

    const tenantID = decoded.tenantID;

    this.userConnections.get(tenantID)?.delete(client.id);
    if (this.userConnections.get(tenantID).size === 0) {
      this.userConnections.delete(tenantID);
    }
    console.log(`Client disconnected: ${client.id}`);

    // this.clients.delete(tenantID);
  }
}
