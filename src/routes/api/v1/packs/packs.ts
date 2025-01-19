import { Router } from "express";
import semver from "semver";
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
    next(new Error("403: No Access"));
  } else {
    db.table<Modpack>("modpacks")
      .add(req.body as Modpack)
      .then((modpack) => {
        res.status(200);
        res.header("Content-Type", "application/json");
        res.send(JSON.stringify(modpack));
        res.end();
      })
      .catch(next);
  }
});

/**
 * GET   /v1/packs
 *
 * Lists all modpacks on the server.
 */
apiModpacksV1Route.get("/", (req, res, next) => {
  getModpacks(req.query.version as string)
    .then((modpacks) => {
      res.status(200);
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(modpacks));
      res.end();
    })
    .catch(next);
});
