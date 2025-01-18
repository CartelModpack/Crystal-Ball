import { json, Router, urlencoded } from "express";
import { enforceAuth } from "../../../modules/auth.js";
import { apiMetaV1Route } from "./meta.js";
import { modpacksApiV1Route } from "./modpack.js";

export const apiV1Route = Router();

apiV1Route.use(json());
apiV1Route.use(urlencoded({ extended: true }));
apiV1Route.use(enforceAuth);

apiV1Route.use("/modpacks", modpacksApiV1Route);
apiV1Route.use("/meta", apiMetaV1Route);
