import { Router } from "express";
import { generateToken } from "../../../../modules/auth.js";

export const authApiV1Route = Router();

authApiV1Route.post("/token", (req, res) => {
  const token = generateToken({
    name: "Debug",
    id: 0,
  });

  res.status(200);
  res.header("Content-Type", "application/json");
  res.send({ token });
  res.end();
});
