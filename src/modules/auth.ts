import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

// Users

export type User = {
  username: string;
  key: string;
};

// JWT

export const generateToken: (username: string) => string = (username) => {
  return jwt.sign({ user: username }, config().jwt, { expiresIn: "15m" });
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
      if (err) {
        next();
      } else {
        req.auth = data as { iat: number; exp: number };
        next();
      }
    });
  }
};
