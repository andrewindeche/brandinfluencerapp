import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../session/session.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly bypassInTestMode = process.env.NODE_ENV === 'test',
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.bypassInTestMode) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('Session ID missing');
    }

    const session = await this.sessionService.getSession(sessionId);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    request.user = {
      ...session,
    };
    return true;
  }
}
