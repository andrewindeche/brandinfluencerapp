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
    console.log('[NotificationGateway] Client joining influencer room:', influencerId);
    client.join(`influencer-${influencerId}`);
  }

  @SubscribeMessage('join-brand')
  handleJoinBrand(
    @MessageBody() brandId: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('[NotificationGateway] Client joining brand room:', brandId);
    client.join(`brand-${brandId}`);
  }

  sendToBrand(brandId: string, payload: any) {
    console.log('[NotificationGateway] Sending to brand:', brandId, payload);
    this.server.to(`brand-${brandId}`).emit('submission-event', payload);
  }

  sendToInfluencer(influencerId: string, payload: any) {
    const room = `influencer-${influencerId}`;
    console.log('[NotificationGateway] Sending to influencer:', influencerId, 'room:', room, 'payload:', payload);
    this.server
      .to(room)
      .emit('submission-event', payload);
  }
}
