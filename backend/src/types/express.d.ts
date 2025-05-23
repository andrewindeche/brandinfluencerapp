import 'express';

declare module 'express' {
  interface Request {
    user?: {
      _id: any;
      sub: string;
      email: string;
      role: string;
    };
  }
}
