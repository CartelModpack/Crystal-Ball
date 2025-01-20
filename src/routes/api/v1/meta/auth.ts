import bcrypt from "bcrypt";
import { Router } from "express";
import {
  APIError,
  catchAPIError,
  sendAPIResponse,
} from "../../../../modules/api.js";
import { generateToken, type User } from "../../../../modules/auth.js";
import { db } from "../../../../modules/db.js";
import { omit } from "../../../../modules/tools.js";
import type { Modpack } from "../packs/packs.js";

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
              const token = generateToken(user.username, user.permissions);

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

/**
 * POST  /v1/auth/register
 *
 * Register a new account and issue a token for it.
 */
apiAuthV1Route.post("/register", (req, res, next) => {
  if (req.auth) {
    if (req.auth.perms === 1) {
      db.table<User>("auth")
        .get(
          ["username"],
          (row) => row.username === (req.body as { username: string }).username,
        )
        .then((users) => {
          if (users.length > 0) {
            next(new APIError(400, "User already exists."));
          } else {
            const key = bcrypt.hashSync(
              (req.body as { password: string }).password,
              10,
            );

            const newUserObj = {
              permissions: 0,
              key,
              ...omit(req.body as { password: string }, "password"),
            } as User;

            if (typeof newUserObj.permissions === "string") {
              newUserObj.permissions =
                String(Number(newUserObj.permissions)) === "NaN"
                  ? 0
                  : Number(newUserObj.permissions);
            }

            db.table<User>("auth")
              .add({
                permissions: 0,
                key,
                ...omit(req.body as { password: string }, "password"),
              } as User)
              .then((user) => {
                const token = generateToken(user.username, user.permissions);

                sendAPIResponse(res, { token });
              })
              .catch(catchAPIError(next));
          }
        })
        .catch(catchAPIError(next));
    } else {
      next(new APIError(403));
    }
  } else {
    next(new APIError(401));
  }
});

/**
 * DELETE /v1/auth/delete
 *
 * Remove an account from the database, and delete all modpacks associated with it.
 */
apiAuthV1Route.delete("/delete", (req, res, next) => {
  if (req.auth) {
    if (req.auth.perms === 1) {
      if (req.auth.user === (req.body as { username: string }).username) {
        next(new APIError(400, "Can't delete own account."));

        return;
      }

      db.table<User>("auth")
        .get(
          ["username"],
          (row) => row.username === (req.body as { username: string }).username,
        )
        .then((users) => {
          if (users.length > 0) {
            db.table<User>("auth")
              .delete("username", (req.body as { username: string }).username)
              .then(() => {
                db.table<Modpack>("modpacks")
                  .delete("author", (req.body as { username: string }).username)
                  .then(() => {
                    sendAPIResponse(res, {
                      status: 200,
                      message: "Successfully removed.",
                    });
                  })
                  .catch(catchAPIError);
              })
              .catch(catchAPIError);
          } else {
            next(new APIError(404, "User doesn't exist."));
          }
        })
        .catch(catchAPIError);
    } else {
      next(new APIError(403));
    }
  } else {
    next(new APIError(401));
  }
});
