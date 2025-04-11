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
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('Session ID missing');
    }

    const session = await this.sessionService.getSession(sessionId);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }
    (request as any).user = session;

    return true;
  }
}

