import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { execAll } from "./lib/exec";
import { getPackVarientManifest } from "./pack";

const PACKWIZ_EXEC = "packwiz";

/** Helper function to compile a pack from a variant manifest. */
const compilePackFromManifest: (
  variant: PackVariantManifest,
  packManifest: PackManifest,
) => Promise<void> = (variant, packManifest) => {
  return new Promise((resolve, reject) => {
    const displayName = `${packManifest.name} [${variant.name}]`;

    const commands: string[] = [
      `${PACKWIZ_EXEC} init --author "${packManifest.author}" --fabric-latest -l --name "${packManifest.main === variant.slug ? packManifest.name : displayName}" --version "${packManifest.version}" -r --modloader fabric -y`,
    ];

    const postCommands: string[] = [];

    for (const resource of variant.resources) {
      let cmd = PACKWIZ_EXEC;

      if (resource.source === "file") {
        cmd = `${cmd} url add ${resource.name} ${resource.url} --meta-folder ${resource.type}`;
      } else {
        cmd = `${cmd} ${resource.source} add ${resource.id} --meta-folder ${resource.type}`;
      }

      commands.push(cmd);
    }

    commands.push(...postCommands, `${PACKWIZ_EXEC} refresh`);

    const binDir = join(process.cwd(), "./bin", variant.slug);

    mkdir(binDir, { recursive: true })
      .then(() => {
        execAll(commands, {
          type: "in-order",
          shouldRejectIfNotZero: true,
          cwd: binDir,
        })
          .then(() => {
            resolve();
          })
          .catch(reject);
      })
      .catch(reject);
  });
};

/**
 * Compile packs variants from the file path.
 *
 * @param variants - The list of file paths.
 * @param packManifest - The pack manifest.
 * @returns A promise that resolves when all packs specifed are built.
 */
export const packwizCompilePacks: (
  variants: string[],
  packManifest: PackManifest,
) => Promise<void> = (variants, packManifest) => {
  return new Promise((resolve, reject) => {
    Promise.all(variants.map((variant) => getPackVarientManifest(variant)))
      .then((variantManifests) => {
        Promise.all(
          variantManifests.map((varManifest) =>
            compilePackFromManifest(varManifest, packManifest),
          ),
        )
          .then(() => {
            resolve();
          })
          .catch(reject);
      })
      .catch(reject);
  });
};
