import { Router } from "express";
import { APIError } from "../../modules/api.js";
import { apiV1Route } from "./v1/v1.js";

export const apiRoutes = Router();

apiRoutes.use("/v1", apiV1Route);

apiRoutes.use(() => {
  throw new APIError(404);
});
