import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth/service/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    let jwtSecret: string;

    if (process.env.JWT_SECRET) {
      jwtSecret = process.env.JWT_SECRET;
    } else if (fs.existsSync('.jwt_secret')) {
      jwtSecret = fs.readFileSync('.jwt_secret', 'utf8');
    } else {
      jwtSecret = crypto.randomBytes(64).toString('hex');
      fs.writeFileSync('.jwt_secret', jwtSecret);
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUserByIdAndRole(
      payload.sub,
      payload.role,
    );

    if (!user) {
      throw new UnauthorizedException('Unauthorized access');
    }

    return {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
  }
}
