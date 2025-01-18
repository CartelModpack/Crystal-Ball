// Modify express requests to allow auth data.
declare namespace Express {
  interface Request {
    /** User ID number, or null if unauthenticated. */
    auth: {
      [key: string]: unknown;
      iat: number;
      exp: number;
    } | null;
  }
}
