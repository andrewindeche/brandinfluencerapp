import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { InfluencerSchema } from './schema/influencer.schema';
import * as crypto from 'crypto';
import * as fs from 'fs';

let secretKey: string;

if (process.env.JWT_SECRET) {
  secretKey = process.env.JWT_SECRET;
} else if (fs.existsSync('.jwt_secret')) {
  secretKey = fs.readFileSync('.jwt_secret', 'utf8');
} else {
  secretKey = crypto.randomBytes(64).toString('hex');
  fs.writeFileSync('.jwt_secret', secretKey);
}

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Influencer', schema: InfluencerSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: secretKey,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
