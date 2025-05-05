import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth/service/auth.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    const jwtSecret = fs
      .readFileSync(path.join(__dirname, '../../.jwt_secret'), 'utf8')
      .trim();

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
      sub: user.id,
      username: user.username,
      role: user.role,
    };
  }
}
