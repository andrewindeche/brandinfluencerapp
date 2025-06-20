import 'express';

declare module 'express' {
  interface Request {
    user?: {
      userId: any;
      _id: any;
      sub: string;
      email: string;
      role: string;
    };
  }
}
