import type { NextFunction, Response } from "express";
import { config } from "./config.js";
import { omit } from "./tools.js";

// Types

/** An API error and its information. */
type APIErrorProps = {
  /** The status code to send. */
  status: number;
  /** The user-readable message attached to this error. */
  message: string;
  /** The error that caused this error. Only displayed in `dev` mode. */
  cause?: string;
};

/**
 * An API error.
 */
export class APIError extends Error {
  static readonly errorMessages: Map<number, string> = new Map();

  readonly status: number;
  readonly message: string;
  readonly cause?: Error;

  /**
   * Construct an API error.
   *
   * @param status - The partial data.
   * @returns A complete set of {@link APIErrorProps}.
   */
  constructor(status?: number, message?: string, cause?: Error);
  constructor(
    status: number | undefined,
    message: string | undefined,
    cause: Error | undefined,
  ) {
    super();

    this.status = status ?? 500;
    this.message =
      message ??
      (config().dev && cause !== undefined
        ? cause.message
        : (APIError.errorMessages.get(this.status) as string));

    if (config().dev) {
      this.cause = cause ?? new Error(this.message);
    }
  }

  /** Get an object representation of the error for web handling. */
  getReadable: () => APIErrorProps = () => {
    const error: APIErrorProps = {
      status: this.status,
      message: this.message,
      cause: String(this.cause),
    };

    return config().dev ? error : omit(error, "cause");
  };
}

APIError.errorMessages.set(200, "Request Successful.");
APIError.errorMessages.set(400, "Unknown User Error.");
APIError.errorMessages.set(401, "Access Restricted.");
APIError.errorMessages.set(403, "Access Forbidden.");
APIError.errorMessages.set(404, "Content Not Found.");
APIError.errorMessages.set(500, "Unknown Server Error.");

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
  sendJSONContent(res, error.getReadable(), error.status);
};

/**
 * Catch an API error from a `Promise.catch()` call and send it via `next()`.
 *
 * @param next - The next function from the router.
 * @param status - The status code you want to send. Defaults to `500`.
 * @returns A method that will be run from a catch call.
 */
export const catchAPIError: (
  next?: NextFunction,
  status?: number,
) => (reason: Error) => void = (next, status) => {
  return (reason) => {
    const error = new APIError(status, reason.message, reason);

    if (next === undefined) {
      throw error;
    } else {
      next(error);
    }
  };
};
