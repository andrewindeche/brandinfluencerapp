import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignsModule } from './campaigns/campaigns.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest_campaigns'),
    CampaignsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
