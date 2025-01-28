import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Get the pack manifest data.
 *
 * @returns An object containing the manifest.
 */
export const getPackManifest = async (): Promise<PackManifest> => {
  return await new Promise((resolve, reject) => {
    readFile(join(process.cwd(), "./pack.json"), "utf-8")
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
export const getPackVarientManifest = async (
  path: string,
): Promise<PackVariantManifest> => {
  return await new Promise((resolve, reject) => {
    readFile(join(process.cwd(), path), "utf-8")
      .then((raw) => {
        const manifest = JSON.parse(raw) as PackVariantManifest;

        if (manifest.inherits === null) {
          resolve(manifest);
        } else {
          // Get the pack varient manifest from the inherited varient.
          getPackVarientManifest(manifest.inherits)
            .then((inherited) => {
              manifest.resources = manifest.resources.filter((resource) => {
                // Remove all repeat files, keeping the file from first reference.

                // Only diff between this and below is url vs id, as files are different.
                if (resource.source === "file") {
                  return (
                    inherited.resources.filter(
                      (r) => r.source === "file" && r.url === resource.url,
                    ).length === 0
                  );
                }

                return (
                  inherited.resources.filter(
                    (r) => r.source !== "file" && r.id === resource.id,
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
