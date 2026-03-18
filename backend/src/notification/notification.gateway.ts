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
    console.log(`Influencer joined room: influencer-${influencerId}`);
  }

  @SubscribeMessage('join-brand')
  handleJoinBrand(
    @MessageBody() campaignId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`brand-${campaignId}`);
    console.log(`Brand joined room: brand-${campaignId}`);
  }

  sendToBrand(brandId: string, payload: any) {
    this.server.to(`brand-${brandId}`).emit('submission-event', payload);
  }

  sendToInfluencer(influencerId: string, payload: any) {
    this.server
      .to(`influencer-${influencerId}`)
      .emit('submission-event', payload);
  }
}
