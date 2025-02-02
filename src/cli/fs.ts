import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Modpack, type ModpackExporter } from "../core/pack";

/** The path to the pack manifest. */
export const PACK_MANIFEST_FILE = "./pack.json";
/** The path to the pack variant manifest directory. */
export const PACK_VARIANT_DIR = "./packs";

/**
 * Get the file path of a pack variant.
 *
 * @param slug - The variant's slug.
 * @returns A string containing the file path.
 */
export const getPackVariantPath = (slug: string): string => {
  return join(PACK_VARIANT_DIR, `./${slug}.json`);
};

/**
 * Creates an export method a modpack that goes to the filesystem.
 *
 * @param cwd - The root working directory.
 * @returns A export method for the a modpack.
 */
export const exportModpackToFS = (
  cwd: string,
): ModpackExporter<Promise<void>> => {
  return (manifest, variants) => {
    return new Promise<void>((resolve, reject) => {
      Promise.all([
        writeFile(
          join(cwd, PACK_MANIFEST_FILE),
          JSON.stringify(manifest, null, 2),
          "utf-8",
        ),
        ...variants.map((variant) => {
          return variant.export((variantManifest) => {
            return writeFile(
              join(cwd, getPackVariantPath(variantManifest.slug)),
              JSON.stringify(variantManifest, null, 2),
              "utf-8",
            );
          });
        }),
      ])
        .then(() => {
          resolve();
        })
        .catch(reject);
    });
  };
};

/**
 * Import a modpack from the filesystem.
 *
 * @param cwd - The working directory of the variant.
 * @returns A modpack instance containing all the pack data.
 */
export const importModpackFromFS = async (cwd: string): Promise<Modpack> => {
  return await new Promise((resolve, reject) => {
    access(join(cwd, PACK_MANIFEST_FILE))
      .then(() => {
        readFile(join(cwd, PACK_MANIFEST_FILE), "utf-8")
          .then((rawPackManifest) => {
            const packManifest = JSON.parse(rawPackManifest) as PackManifest;
            const modpack = Modpack({ ...packManifest, variants: [] });

            Promise.all(
              packManifest.variants.map((slug) =>
                readFile(join(cwd, getPackVariantPath(slug)), "utf-8"),
              ),
            )
              .then((rawVariantManifests) => {
                const variantManifests = rawVariantManifests.map(
                  (rvm) => JSON.parse(rvm) as PackVariantManifest,
                );

                variantManifests.forEach((vnt) => {
                  modpack.addVariant(vnt);
                });

                resolve(modpack);
              })
              .catch(reject);
          })
          .catch(reject);
      })
      .catch(() => {
        reject(new Error("Pack manifest file could not be found."));
      });
  });
};
