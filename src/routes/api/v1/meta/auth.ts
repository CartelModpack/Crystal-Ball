import bcrypt from "bcrypt";
import { Router } from "express";
import { catchAPIError, sendAPIResponse } from "../../../../modules/api.js";
import { generateToken, type User } from "../../../../modules/auth.js";
import { db } from "../../../../modules/db.js";

export const apiAuthV1Route = Router();

/**
 * POST  /v1/auth/login
 *
 * Generate a new JWT for server operations.
 */
apiAuthV1Route.post("/login", (req, res, next) => {
  db.table("auth")
    .all()
    .then((users) => {
      const user = users.find(
        (c) => c.username === (req.body as { username: string }).username,
      ) as unknown as User | null;

      if (user === null) {
        next({
          status: 400,
          message: "Invalid User/Pass",
        });
      } else {
        bcrypt
          .compare((req.body as { password: string }).password, user.key)
          .then((equals) => {
            if (equals) {
              const token = generateToken(user.username);

              sendAPIResponse(res, { token });
            } else {
              next({
                status: 400,
                message: "Invalid User/Pass",
              });
            }
          })
          .catch(catchAPIError(next));
      }
    })
    .catch(catchAPIError(next));
});
