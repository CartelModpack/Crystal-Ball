import { Router, urlencoded } from "express";
import { enforceAuthToken } from "../../../modules/auth.js";
import { authApiV1Route } from "./meta/auth.js";

export const apiMetaV1Route = Router();

apiMetaV1Route.use(urlencoded({ extended: true }));
apiMetaV1Route.use(enforceAuthToken);

apiMetaV1Route.use("/auth", authApiV1Route);
