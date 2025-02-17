import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import AdminJS from 'adminjs';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseAdapter } from '@adminjs/mongoose';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';

AdminJS.registerAdapter(MongooseAdapter);

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest_campaigns'),
    CampaignsModule,
    AuthModule,
    AdminModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
