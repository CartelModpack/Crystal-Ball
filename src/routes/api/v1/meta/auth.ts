import bcrypt from "bcrypt";
import { Router } from "express";
import {
  APIError,
  catchAPIError,
  sendAPIResponse,
} from "../../../../modules/api.js";
import { generateToken, type User } from "../../../../modules/auth.js";
import { db } from "../../../../modules/db.js";

export const apiAuthV1Route = Router();

/**
 * POST  /v1/auth/login
 *
 * Generate a new JWT for server operations.
 */
apiAuthV1Route.post("/login", (req, res, next) => {
  const invalidUserError = new APIError(401, "Invalid User/Pass.");

  db.table("auth")
    .all()
    .then((users) => {
      const user = users.find(
        (c) => c.username === (req.body as { username: string }).username,
      ) as unknown as User | undefined;

      if (user === undefined) {
        next(invalidUserError);
      } else {
        bcrypt
          .compare((req.body as { password: string }).password, user.key)
          .then((equals) => {
            if (equals) {
              const token = generateToken(user.username);

              sendAPIResponse(res, { token });
            } else {
              next(invalidUserError);
            }
          })
          .catch(catchAPIError(next));
      }
    })
    .catch(catchAPIError(next));
});
