import 'express';

declare module 'express' {
  interface Request {
    user?: {
      sub: string;
      email: string;
      role: string;
    };
  }
}
