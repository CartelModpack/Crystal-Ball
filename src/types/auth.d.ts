// Modify express requests to allow auth data.
declare namespace Express {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Request {
    /** User ID number, or null if unauthenticated. */
    auth: {
      /** The user account name. */
      user: string;
      /** The user account perms. */
      perms: number;
      /** Time JWT was issued. */
      iat: number;
      /** Time JWT will expire. */
      exp: number;
    } | null;
  }
}
