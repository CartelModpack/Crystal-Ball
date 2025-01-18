import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

// Users

export interface User {
  name: string;
  id: number;
}

// JWT

export const generateToken: (user: User) => string = (user) => {
  return jwt.sign({ user }, config.jwt, { expiresIn: "7d" });
};

export const enforceAuth: (
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
    jwt.verify(token, config.jwt, {}, (err, data) => {
      if (err) {
        next();
      } else {
        req.auth = data as { iat: number; exp: number };
        next();
      }
    });
  }
};
