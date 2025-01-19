import { json, Router, urlencoded } from "express";
import { enforceAuthToken } from "../../../modules/auth.js";
import { apiAuthV1Route } from "./meta/auth.js";
import { apiMetaReloadV1Route } from "./meta/reload.js";
import { apiModpacksV1Route } from "./packs/modpacks.js";

export const apiV1Route = Router();

apiV1Route.use(json());
apiV1Route.use(urlencoded({ extended: true }));
apiV1Route.use(enforceAuthToken);

apiV1Route.use("/modpacks", apiModpacksV1Route);
apiV1Route.use("/auth", apiAuthV1Route);
apiV1Route.use("/conf", apiMetaReloadV1Route);
