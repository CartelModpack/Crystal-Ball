import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { omit } from "./tools.js";

// Types

/** An API error and its information. */
type APIErrorObject = {
  /** The status code to send. */
  status: number;
  /** The error message. */
  message: string;
  /** An error object, only sent to client in dev mode. */
  error: Error;
};

/** An error code or error information. */
type APIError = number | Partial<APIErrorObject>;

// Defaults

const errorMessages: Map<number, string> = new Map();

errorMessages.set(200, "Request Successful.");
errorMessages.set(400, "Unknown User Error.");
errorMessages.set(403, "Access Restricted.");
errorMessages.set(404, "Content Not Found.");
errorMessages.set(500, "Unknown Server Error.");

// Helpers

/**
 * Send data as JSON.
 *
 * @param res - The response object from the handler.
 * @param content - The content to send.
 * @param status - The status code.
 */
const sendJSONContent: (
  res: Response,
  content: unknown,
  status: number,
) => void = (res, content, status) => {
  res.status(status);
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify(content));
  res.end();
};

/**
 * Parse an API error code/partial API error data into a complete error.
 *
 * @param error - The partial data.
 * @returns A complete {@link APIErrorObject}.
 */
const parseAPIError: (error: APIError) => APIErrorObject = (error) => {
  if (typeof error === "number") {
    const outError: APIErrorObject = {
      status: error,
      message: errorMessages.get(error) as string,
      error: new Error(errorMessages.get(error)),
    };

    return outError;
  }

  const status = error.status ?? 500;

  const out: APIErrorObject = {
    status,
    message:
      error.message ??
      (error.error !== undefined && config().dev
        ? error.error.message
        : (errorMessages.get(status) as string)),
    error: error.error ?? new Error(errorMessages.get(status)),
  };

  return out;
};

// Exports

/**
 * Send a (successful) API response.
 *
 * @param res - The response object from the handler.
 * @param content - The content to send.
 */
export const sendAPIResponse: (res: Response, content: unknown) => void = (
  res,
  content,
) => {
  sendJSONContent(res, content, 200);
};

/**
 * Send an API error.
 *
 * @param res - The response object from the handler.
 * @param error - The error data.
 */
export const sendAPIError: (res: Response, error: APIError) => void = (
  res,
  error,
) => {
  const parsedError = parseAPIError(error);

  sendJSONContent(
    res,
    config().dev ? omit(parsedError, "error") : parsedError,
    parsedError.status,
  );
};

/**
 * Catch an API error from a `Promise.catch()` call.
 *
 * @param next - The next function from the handler.
 * @param status - The status code you want to send. Defaults to `500`.
 * @returns A method that will be run from a catch call.
 */
export const catchAPIError: (
  next: NextFunction,
  status?: number,
) => (reason: Error) => void = (next, status) => {
  return (reason) => {
    next({ status, error: reason });
  };
};

export const handleAPIError: (
  error: APIError,
  req: Request,
  res: Response,
  next: NextFunction,
  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
) => void = (error, _req, res, _next) => {
  sendAPIError(res, error);
};
