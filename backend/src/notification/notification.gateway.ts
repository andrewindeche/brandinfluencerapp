import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-influencer')
  handleJoinInfluencer(
    @MessageBody() influencerId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`influencer-${influencerId}`);
  }

  @SubscribeMessage('join-brand')
  handleJoinBrand(
    @MessageBody() brandId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`brand-${brandId}`);
  }

  sendToBrand(brandId: string, payload: any) {
    console.log('[NotificationGateway] sendToBrand - brandId:', brandId, 'room:', `brand-${brandId}`);
    this.server.to(`brand-${brandId}`).emit('submission-event', payload);
  }

  sendToInfluencer(influencerId: string, payload: any) {
    const room = `influencer-${influencerId}`;
    console.log('[NotificationGateway] sendToInfluencer - influencerId:', influencerId, 'room:', room, 'payload:', payload);
    const clients = this.server.sockets.adapter.rooms.get(room);
    console.log('[NotificationGateway] Clients in room:', room, 'count:', clients?.size || 0);
    this.server
      .to(room)
      .emit('submission-event', payload);
  }
}
