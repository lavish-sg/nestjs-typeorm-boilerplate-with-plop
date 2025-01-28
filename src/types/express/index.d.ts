export {};

declare global {
  namespace Express {
    export interface Request {
      tokenData: {
        id?: string;
        email: string;
        [key: string]: string;
      };
      currentUser: User & { permissions: string[] };
    }
  }
}
