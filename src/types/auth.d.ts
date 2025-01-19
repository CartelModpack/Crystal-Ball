// Modify express requests to allow auth data.
declare namespace Express {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Request {
    /** User ID number, or null if unauthenticated. */
    auth: {
      [key: string]: unknown;
      /** Time JWT was issued. */
      iat: number;
      /** Time JWT will expire. */
      exp: number;
    } | null;
  }
}
