import { Router } from "express";
import semver from "semver";
import {
  APIError,
  catchAPIError,
  sendAPIResponse,
} from "../../../../modules/api.js";
import { db } from "../../../../modules/db.js";
import { omit } from "../../../../modules/tools.js";

export const apiModpacksV1Route = Router();

/** A modpack. */
export type Modpack = {
  name: string;
  slug: string;
  version: number;
  author: string;
  inherits: string;
  supportedMCVersions: string;
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
const getModpacks: (version?: string, slug?: string) => Promise<Modpack[]> = (
  version,
  slug,
) => {
  // All but mod files
  const cols: string[] = [
    "name",
    "slug",
    "version",
    "author",
    "inherits",
    "supportedMCVersions",
  ];

  if (version !== undefined) {
    return db.table<Modpack>("modpacks").get(cols, (modpack) => {
      if (
        slug !== undefined &&
        !slug.split(",").includes((modpack as Modpack).slug)
      ) {
        return false;
      }

      const vers = (modpack as Modpack).supportedMCVersions.split(",");

      for (const ver of vers) {
        if (ver.trim() === "") {
          continue;
        }

        if (!semver.satisfies(version, ver)) {
          return false;
        }
      }

      return true;
    }) as Promise<Modpack[]>;
  }

  if (slug !== undefined) {
    return db
      .table<Modpack>("modpacks")
      .get(cols, (modpack) =>
        slug.split(",").includes((modpack as Modpack).slug),
      ) as Promise<Modpack[]>;
  }

  return db.table<Modpack>("modpacks").all(...cols) as Promise<Modpack[]>;
};

/**
 * POST  /v1/packs/create
 *
 * Adds a modpack to the server.
 */
apiModpacksV1Route.post("/create", (req, res, next) => {
  if (req.auth === null) {
    next(new APIError(401));
  } else {
    const pack = {
      ...(req.body as Partial<Modpack>),
      author: req.auth.user,
    } as Modpack;

    db.table<Modpack>("modpacks")
      .add(pack)
      .then((modpack) => {
        sendAPIResponse(res, modpack);
      })
      .catch(catchAPIError(next));
  }
});

/**
 * DELETE  /v1/packs/delete
 *
 * Removes a modpack to the server.
 */
apiModpacksV1Route.delete("/delete", (req, res, next) => {
  if (
    req.auth &&
    ((req.body as { slug: string }).slug === req.auth.user ||
      req.auth.perms === 1)
  ) {
    db.table<Modpack>("modpacks")
      .get(
        [],
        (pack) =>
          (pack as Modpack).slug === (req.body as { slug: string }).slug,
      )
      .then((pack) => {
        if (pack.length > 0) {
          db.table<Modpack>("modpacks")
            .delete("slug", (req.body as { slug: string }).slug)
            .then(() => {
              sendAPIResponse(res, {
                status: 200,
                message: "Modpack removed.",
              });
            })
            .catch(catchAPIError(next));
        } else {
          next(new APIError(404, "Invalid modpack."));
        }
      })
      .catch(catchAPIError(next));
  } else {
    next(new APIError(401));
  }
});

const mergeArray = (arr1: unknown[], arr2: unknown[]): unknown[] => {
  const out = arr1;

  for (const itm of arr2) {
    if (!out.includes(itm)) {
      out.push(itm);
    }
  }

  return out;
};

const includeInherits = (parent: Modpack, object: Modpack) => {
  return new Promise<Modpack>((resolve, reject) => {
    db.table<Modpack>("modpacks")
      .get(
        ["slug", "mods", "resources", "shaders", "configs", "inherits"],
        (row) => (row as Modpack).slug === parent.inherits,
      )
      .then((inheritedPack) => {
        if (inheritedPack.length > 0) {
          object.mods = mergeArray(
            object.mods.split(","),
            inheritedPack[0].mods.split(","),
          ).join(",");
          object.resources = mergeArray(
            object.resources.split(","),
            inheritedPack[0].resources.split(","),
          ).join(",");
          object.shaders = mergeArray(
            object.shaders.split(","),
            inheritedPack[0].shaders.split(","),
          ).join(",");
          object.configs = mergeArray(
            object.configs.split(","),
            inheritedPack[0].configs.split(","),
          ).join(",");

          if (
            ((inheritedPack[0] as Modpack).inherits as string | null) === null
          ) {
            resolve(object);
          } else {
            includeInherits(inheritedPack[0] as Modpack, object)
              .then(resolve)
              .catch(reject);
          }
        } else {
          resolve(object);
        }
      })
      .catch(reject);
  });
};

/**
 * GET   /v1/packs/:slug/resources
 *
 * Get a modpack on the server.
 */
apiModpacksV1Route.get("/:slug/resources", (req, res, next) => {
  db.table<Modpack>("modpacks")
    .get(
      ["slug", "mods", "resources", "shaders", "configs", "inherits"],
      (row) => (row as Modpack).slug === req.params.slug,
    )
    .then((pack) => {
      console.info(pack);
      if (pack.length > 0) {
        if ((pack[0].inherits as string | null) === null) {
          sendAPIResponse(res, omit(pack[0], "inherits", "slug"));
        } else {
          const finalPack = pack[0] as Modpack;

          includeInherits(pack[0] as Modpack, finalPack)
            .then(() => {
              sendAPIResponse(res, omit(finalPack, "inherits", "slug"));
            })
            .catch(catchAPIError(next));
        }
      } else {
        next(new APIError(404));
      }
    })
    .catch(catchAPIError(next));
});

/**
 * GET   /v1/packs/:slug
 *
 * Get a modpack on the server.
 */
apiModpacksV1Route.get("/:slug", (req, res, next) => {
  db.table<Modpack>("modpacks")
    .get([], (row) => (row as Modpack).slug === req.params.slug)
    .then((pack) => {
      if (pack.length > 0) {
        sendAPIResponse(res, pack[0]);
      } else {
        next(new APIError(404));
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
  getModpacks(req.query.version as string, req.query.slug as string)
    .then((modpacks) => {
      sendAPIResponse(res, modpacks);
    })
    .catch(catchAPIError(next));
});
