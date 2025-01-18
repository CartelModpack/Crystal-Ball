import { Router } from "express";
import semver from "semver";
import { db } from "../../../modules/db.js";

export const modpacksApiV1Route = Router();

interface Modpack {
  slug: string;
  inherits: string;
  supportedVersions: string;
  mods: string;
  resources: string;
  shaders: string;
  configs: string;
}

const getModpacks: (version?: string) => Promise<Modpack[]> = (version) => {
  if (version !== undefined) {
    return db.table("modpacks").get([], (modpack) => {
      const vers = (modpack as Modpack).supportedVersions.split(",");

      for (const ver of vers) {
        if (!semver.satisfies(version, ver)) {
          return false;
        }
      }

      return true;
    }) as Promise<Modpack[]>;
  }

  return db.table("modpacks").all() as unknown as Promise<Modpack[]>;
};

modpacksApiV1Route.get("/list", (req, res, next) => {
  getModpacks(req.query.version as string)
    .then((modpacks) => {
      res.status(200);
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(modpacks));
      res.end();
    })
    .catch(next);
});

modpacksApiV1Route.post("/new", (req, res, next) => {
  console.debug(req.headers.authorization);
  console.debug(req.body);
  if (req.auth === null) {
    next(new Error("403: No Access"));
  } else {
    res.status(200);
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(req.body));
    res.end();
  }
});
