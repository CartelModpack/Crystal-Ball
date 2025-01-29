import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { stackObjects } from "../lib/obj";

export const PACK_MANIFEST_FILE = "./pack.json";
export const PACK_VARIANT_DIR = "./packs";

const DEFAULT_CONFIG: FSConfig = {
  cwd: process.cwd(),
};

/**
 * Get the pack manifest data.
 *
 * @returns An object containing the manifest.
 */
export const getPackManifest: (
  config?: Partial<FSConfig>,
) => Promise<PackManifest> = async (conf) => {
  const config = stackObjects<FSConfig>(DEFAULT_CONFIG, conf ?? {});

  return await new Promise((resolve, reject) => {
    readFile(join(config.cwd, PACK_MANIFEST_FILE), "utf-8")
      .then((raw) => {
        resolve(JSON.parse(raw) as PackManifest);
      })
      .catch(reject);
  });
};

/**
 * Gets a pack varient manifest, including all inherited resources.
 *
 * @param path - The path to the varient manifest file.
 * @returns An object containing the manifest.
 */
export const getPackVarientManifest: (
  path: string,
  config?: Partial<FSConfig>,
) => Promise<PackVariantManifest> = async (path, conf) => {
  const config = stackObjects<FSConfig>(DEFAULT_CONFIG, conf ?? {});

  return await new Promise((resolve, reject) => {
    readFile(join(config.cwd, path), "utf-8")
      .then((raw) => {
        const manifest = JSON.parse(raw) as PackVariantManifest;

        if (manifest.inherits === null) {
          resolve(manifest);
        } else {
          // Get the pack varient manifest from the inherited varient.
          getPackVarientManifest(
            join(PACK_VARIANT_DIR, `${manifest.inherits}.json`),
            conf,
          )
            .then((inherited) => {
              manifest.resources = manifest.resources.filter((resource) => {
                // Remove all repeat files, keeping the file from first reference.

                // Only diff between this and below is url vs id, as files are different.
                if (resource.source === "url") {
                  return (
                    inherited.resources.filter(
                      (r) => r.source === "url" && r.url === resource.url,
                    ).length === 0
                  );
                }

                return (
                  inherited.resources.filter(
                    (r) => r.source !== "url" && r.id === resource.id,
                  ).length === 0
                );
              });

              // Merge resources.
              manifest.resources = [
                ...inherited.resources,
                ...manifest.resources,
              ];

              resolve(manifest);
            })
            .catch(reject);
        }
      })
      .catch(reject);
  });
};

/**
 * Get a pack variant manifest from a slug ID.
 *
 * @param slug - The slug ID to look for.
 * @returns The pack variant manifest.
 */
export const getPackVarientFromSlug: (
  slug: string,
  config?: Partial<FSConfig>,
) => Promise<PackVariantManifest> = async (slug, conf) => {
  return await getPackVarientManifest(
    join(PACK_VARIANT_DIR, `${slug}.json`),
    conf,
  );
};
