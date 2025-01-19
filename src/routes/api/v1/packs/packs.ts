import { Router } from "express";
import semver from "semver";
import { catchAPIError, sendAPIResponse } from "../../../../modules/api.js";
import { db } from "../../../../modules/db.js";

export const apiModpacksV1Route = Router();

/** A modpack. */
export type Modpack = {
  slug: string;
  inherits: string;
  supportedVersions: string;
  mods: string;
  resources: string;
  shaders: string;
  configs: string;
};

/**
 * Get modpacks using the correct promise.
 *
 * @param version - The version that we would be use.
 * @returns The correct promise.
 */
const getModpacks: (version?: string) => Promise<Modpack[]> = (version) => {
  if (version !== undefined) {
    return db.table<Modpack>("modpacks").get([], (modpack) => {
      const vers = (modpack as Modpack).supportedVersions.split(",");

      for (const ver of vers) {
        if (!semver.satisfies(version, ver)) {
          return false;
        }
      }

      return true;
    }) as Promise<Modpack[]>;
  }

  return db.table("modpacks").all() as Promise<Modpack[]>;
};

/**
 * POST  /v1/packs/new
 *
 * Adds a new modpack to the the server.
 */
apiModpacksV1Route.post("/create", (req, res, next) => {
  if (req.auth === null) {
    next(403);
  } else {
    db.table<Modpack>("modpacks")
      .add(req.body as Modpack)
      .then((modpack) => {
        sendAPIResponse(res, modpack);
      })
      .catch(catchAPIError(next));
  }
});

apiModpacksV1Route.get("/:slug", (req, res, next) => {
  db.table<Modpack>("modpacks")
    .get([], (row) => (row as Modpack).slug === req.params.slug)
    .then((pack) => {
      if (pack.length > 0) {
        sendAPIResponse(res, pack[0]);
      } else {
        next({
          status: 404,
          message: "No modpack found.",
        });
      }
    })
    .catch(catchAPIError(next));
});

/**
 * GET   /v1/packs
 *
 * Lists all modpacks on the server.
 */
apiModpacksV1Route.get("/", (req, res, next) => {
  getModpacks(req.query.version as string)
    .then((modpacks) => {
      sendAPIResponse(res, modpacks);
    })
    .catch(catchAPIError(next));
});
