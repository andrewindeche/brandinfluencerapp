import { SessionAuthGuard } from './session-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { Request } from 'express';

describe('SessionAuthGuard', () => {
  let guard: SessionAuthGuard;
  let sessionService: jest.Mocked<SessionService>;

  const mockContext = (cookieSessionId?: string): ExecutionContext => {
    const req: Partial<Request> = {
      cookies: cookieSessionId ? { sessionId: cookieSessionId } : {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    sessionService = {
      getSession: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;

    guard = new SessionAuthGuard(sessionService);
  });

  it('should throw if session ID is missing', async () => {
    const context = mockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Session ID missing'),
    );
  });

  it('should throw if session is invalid or expired', async () => {
    const context = mockContext('invalid-session-id');
    sessionService.getSession.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired session'),
    );
  });

  it('should allow access and attach session if valid', async () => {
    const sessionData = { userId: '123', role: 'influencer' };
    const context = mockContext('valid-session-id');

    const req = context.switchToHttp().getRequest() as any;
    sessionService.getSession.mockResolvedValue(sessionData);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(req.user).toEqual(sessionData);
  });
});
