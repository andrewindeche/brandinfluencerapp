import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth/service/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    console.log('✅ JwtStrategy registered');
  }

  async validate(payload: any) {
    console.log('🔥 JWT payload received in strategy:', payload);
    const user = await this.authService.validateUserByIdAndRole(
      payload.sub,
      payload.role,
    );
    console.log('Fetched user:', user);

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
