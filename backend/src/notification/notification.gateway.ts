import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendToBrand(campaignId: string, payload: any) {
    this.server.to(`brand-${campaignId}`).emit('submission-event', payload);
  }

  sendToInfluencer(influencerId: string, payload: any) {
    this.server
      .to(`influencer-${influencerId}`)
      .emit('submission-event', payload);
  }
}
