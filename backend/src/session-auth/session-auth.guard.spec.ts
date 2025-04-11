import { SessionAuthGuard } from './session-auth.guard';

describe('SessionAuthGuard', () => {
  it('should be defined', () => {
    expect(new SessionAuthGuard()).toBeDefined();
  });
});
