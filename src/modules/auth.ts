import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

// Users

export type User = {
  username: string;
  permissions: number;
  key: string;
};

// JWT

export const generateToken: (user: string, perms: number) => string = (
  user,
  perms,
) => {
  return jwt.sign({ user, perms }, config().jwt, {
    expiresIn: "30m",
  });
};

export const enforceAuthToken: (
  req: Request,
  res: Response,
  next: NextFunction,
) => void = (req, res, next) => {
  req.auth = null;

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (token === undefined) {
    next();
  } else {
    jwt.verify(token, config().jwt, {}, (err, data) => {
      if (!err) {
        req.auth = data as {
          iat: number;
          exp: number;
          user: string;
          perms: number;
        };
        req.auth.perms = Number(req.auth.perms);
      }
      next();
    });
  }
};
