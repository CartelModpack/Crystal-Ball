import { json, Router } from "express";
import { validateAuth } from "../../../modules/auth.js";
import { modpacksApiV1Route } from "./modpack.js";

export const apiV1Route = Router();

apiV1Route.use(json());

apiV1Route.use(validateAuth);

apiV1Route.use("/modpacks", modpacksApiV1Route);
