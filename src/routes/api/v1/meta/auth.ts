import bcrypt from "bcrypt";
import { Router } from "express";
import { generateToken, type User } from "../../../../modules/auth.js";
import { db } from "../../../../modules/db.js";

export const apiAuthV1Route = Router();

apiAuthV1Route.post("/login", (req, res, next) => {
  db.table("auth")
    .all()
    .then((users) => {
      const user = users.find(
        (c) => c.username === (req.body as { username: string }).username,
      ) as unknown as User | null;

      if (user === null) {
        next(new Error("No user."));

        return;
      }

      bcrypt
        .compare((req.body as { password: string }).password, user.key)
        .then((equals) => {
          if (equals) {
            const token = generateToken(user.username);

            res.status(200);
            res.header("Content-Type", "application/json");
            res.send({ token });
            res.end();
          } else {
            next(new Error("Wrong pass."));
          }
        })
        .catch(next);
    })
    .catch(next);
});
