import { Router } from "express";
import { apiV1Route } from "./v1/v1.js";

export const apiRoutes = Router();

apiRoutes.use("/v1", apiV1Route);
