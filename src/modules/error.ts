import { readFile } from "node:fs";
import { join } from "node:path";
import type { NextFunction, Request, Response } from "express";
import { APIError, sendAPIError } from "./api.js";

/**
 * ExpressJS middleware to handle errors.
 */
export const errorHandler: (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => void = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);

    return;
  }

  if (error instanceof APIError) {
    console.warn(error.getReadable());
    sendAPIError(res, error);
  } else {
    readFile(join(process.cwd(), "./site/404.html"), "utf-8", (error, data) => {
      res.status(404);
      res.header("Content-Type", "text/html");
      if (error) {
        console.warn(error);
        res.send("<h1><code>404 File Not Found</code></h1>");
      } else {
        res.send(data);
      }
      res.end();
    });
  }
};
