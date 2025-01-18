import { json, Router } from "express";
import { enforceAuth } from "../../../modules/auth.js";
import { modpacksApiV1Route } from "./modpack.js";

export const apiV1Route = Router();

apiV1Route.use(json());

apiV1Route.use(enforceAuth);

apiV1Route.use("/modpacks", modpacksApiV1Route);
