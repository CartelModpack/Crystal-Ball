import { json, Router, urlencoded } from "express";
import { handleAPIError } from "../../../modules/api.js";
import { enforceAuthToken } from "../../../modules/auth.js";
import { apiAuthV1Route } from "./meta/auth.js";
import { schemaAPIv1Route } from "./meta/schema.js";
import { apiModpacksV1Route } from "./packs/packs.js";

export const apiV1Route = Router();

apiV1Route.use(json());
apiV1Route.use(urlencoded({ extended: true }));
apiV1Route.use(enforceAuthToken);

apiV1Route.use("/packs", apiModpacksV1Route);
apiV1Route.use("/auth", apiAuthV1Route);
apiV1Route.use("/schema", schemaAPIv1Route);

apiV1Route.use("*", handleAPIError);
