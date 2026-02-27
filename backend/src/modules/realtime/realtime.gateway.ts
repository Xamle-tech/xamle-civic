import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:policy')
  handlePolicySubscribe(
    @MessageBody() policyId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`policy:${policyId}`);
    this.logger.log(`Client ${client.id} subscribed to policy:${policyId}`);
  }

  @SubscribeMessage('unsubscribe:policy')
  handlePolicyUnsubscribe(
    @MessageBody() policyId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`policy:${policyId}`);
  }

  @SubscribeMessage('subscribe:dashboard')
  handleDashboardSubscribe(@ConnectedSocket() client: Socket) {
    client.join('dashboard');
  }

  emitPolicyUpdate(policyId: string, data: unknown) {
    this.server.to(`policy:${policyId}`).emit('policy:updated', data);
    this.server.to('dashboard').emit('dashboard:refresh', { policyId });
  }

  emitNewContribution(policyId: string, contribution: unknown) {
    this.server.to(`policy:${policyId}`).emit('contribution:new', contribution);
  }

  emitStatsUpdate(stats: unknown) {
    this.server.to('dashboard').emit('stats:updated', stats);
  }
}
