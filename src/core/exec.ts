import { mkdir, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { arg, execAll } from "../lib/exec";
import type { Modpack } from "./pack";

/** Config for executing packwiz commands. */
interface PackwizExecConfig {
  /** The exact path to the packwiz executable. */
  packwizPath: string;
  /** The root working directory for the proect. */
  cwd: string;
}

/** Builds the config. */
const buildConfig: (
  ...overrides: Partial<PackwizExecConfig>[]
) => PackwizExecConfig = (...overrides) => {
  return Object.stack<PackwizExecConfig>(
    {
      packwizPath: "packwiz",
      cwd: process.cwd(),
    },
    ...overrides,
  );
};

/** Helper function to get the path to the packwiz executable. */
const generatePackwizPath: (path: string, cwd: string) => string = (
  path,
  cwd,
) => {
  if (path.startsWith(".")) {
    return join(cwd, process.platform === "win32" ? `${path}.exe` : path);
  }

  return process.platform === "win32" ? `${path}.exe` : path;
};

/** Helper function to generate a packwiz command. */
const generatePackwizCommand: (
  command: string,
  path: string,
  cwd: string,
) => string = (command, path, cwd) => {
  return `${generatePackwizPath(path, cwd)} ${command}`;
};

const getPackwizCompatableType = (type: string | null): string | null => {
  switch (type) {
    case "mod": {
      return "mods";
    }
    case "resourcepack": {
      return "resourcepacks";
    }
    case "shader": {
      return "shaderpacks";
    }
    case "config": {
      return "config";
    }
    case null: {
      return null;
    }
    default: {
      throw new Error(`Type "${type}" is not compatible with Crystal Ball.`);
    }
  }
};

/** Helper function to compile a pack from a variant manifest. */
const compilePackFromManifest: (
  variant: PackVariantManifest,
  targets: string[],
  packManifest: PackManifest,
  config: PackwizExecConfig,
) => Promise<void> = async (
  variant,
  targets,
  packManifest,
  { packwizPath, cwd },
) => {
  await new Promise<void>((resolve, reject) => {
    const displayName = `${packManifest.name} [${variant.name}]`;

    Promise.all(
      targets.map((target) => {
        return new Promise<void>((resolve, reject) => {
          const commands: string[] = [
            generatePackwizCommand(
              `init --author ${arg(packManifest.author)} --mc-version ${arg(target)} --fabric-latest --name ${arg(packManifest.main === variant.slug ? packManifest.name : displayName)} --version ${arg(packManifest.version)} -r --modloader fabric -y`,
              packwizPath,
              cwd,
            ),
          ];

          const postCommands: string[] = [];

          for (const resource of variant.resources) {
            let cmd: string;

            if (resource.source === "url") {
              cmd = generatePackwizCommand(
                `${resource.source} add ${arg(resource.name)} ${arg(resource.url)} --meta-folder ${arg(getPackwizCompatableType(resource.type))} -y`,
                packwizPath,
                cwd,
              );
            } else {
              cmd = generatePackwizCommand(
                `${resource.source} add ${arg(resource.id)} --meta-folder ${arg(getPackwizCompatableType(resource.type))} -y`,
                packwizPath,
                cwd,
              );
            }

            commands.push(cmd);
          }

          commands.push(
            ...postCommands,
            generatePackwizCommand("refresh -y", packwizPath, cwd),
          );

          const binDir = join(cwd, "./bin", target, variant.slug);

          mkdir(binDir, { recursive: true })
            .then(() => {
              execAll(commands, {
                type: "in-order",
                shouldRejectIfNotZero: false,
                shouldShowErrors: true,
                cwd: binDir,
              })
                .then(() => {
                  resolve();
                })
                .catch(reject);
            })
            .catch(reject);
        });
      }),
    )
      .then(() => {
        resolve();
      })
      .catch(reject);
  });
};

const packwizCompilePacksHelper = async (
  modpack: Modpack,
  variants: string[],
  targets: string[],
  config: PackwizExecConfig,
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    modpack.export((manifest, packVariants) => {
      Promise.all(
        packVariants
          .map((vnt) => vnt.exportWithInherited(modpack, (vntMnf) => vntMnf))
          .filter((vnt) => variants.includes(vnt.slug))
          .map((vnt) =>
            compilePackFromManifest(vnt, targets, manifest, config),
          ),
      )
        .then(() => {
          resolve();
        })
        .catch(reject);
    });
  });
};

/**
 * Compile packs variants from the file path.
 *
 * @param variants - The list of variant slugs.
 * @param targets - The list of targets.
 * @param modpack - The pack manifest.
 * @param conf - The config for the execution.
 * @returns A promise that resolves when all packs specifed are built.
 */
export const packwizCompilePacks: (
  variants: string[],
  targets: string[],
  modpack: Modpack,
  config?: Partial<PackwizExecConfig>,
) => Promise<void> = async (variants, targets, modpack, conf) => {
  const config = buildConfig(conf ?? {});

  await new Promise<void>((resolve, reject) => {
    rmdir(join(config.cwd, "./bin"))
      .then(() => {
        packwizCompilePacksHelper(modpack, variants, targets, config)
          .then(resolve)
          .catch(reject);
      })
      .catch(() => {
        packwizCompilePacksHelper(modpack, variants, targets, config)
          .then(resolve)
          .catch(reject);
      });
  });
};

/** Helper to export packs. */
const packwizExportPacksHelper: (
  modpack: Modpack,
  targets: string[],
  variants: string[],
  config: PackwizExecConfig,
) => Promise<void> = async (modpack, targets, variants, config) => {
  await new Promise<void>((resolve, reject) => {
    const matrix: [string, string][] = [];

    targets.forEach((target) => {
      variants.forEach((variant) => {
        matrix.push([target, variant]);
      });
    });

    Promise.all(
      matrix
        .map((mtx) => {
          return [
            join(config.cwd, `./bin/${mtx[0]}/${mtx[1]}`),
            join(config.cwd, `./exports/${mtx[0]}/${mtx[1]}`),
            mtx,
          ] as [string, string, [string, string]];
        })
        .map((map) => {
          const filename = `${modpack.manifest.slug}-${map[2][1]}`;

          const filenameModrinth = `./${filename}.mrpack`;
          const filenameCurseforge = `./${filename}.zip`;

          return Promise.all([
            mkdir(map[1], { recursive: true }),
            execAll(
              [
                generatePackwizCommand(
                  `modrinth export -o ${join(map[1], filenameModrinth)} -y`,
                  config.packwizPath,
                  config.cwd,
                ),
                generatePackwizCommand(
                  `curseforge export -o ${join(map[1], filenameCurseforge)} -y`,
                  config.packwizPath,
                  config.cwd,
                ),
              ],
              {
                cwd: map[0],
                type: "at-once",
              },
            ),
          ]);
        }),
    )
      .then(() => {
        resolve();
      })
      .catch(reject);
  });
};

/**
 * Export compiled packwiz packs to /exports.
 *
 * @param modpack - The modpack instance to compile.
 * @param targets - The targets to export.
 * @param variants - The variants to export.
 * @param conf - The config for exporting.
 */
export const packwizExportPacks: (
  modpack: Modpack,
  targets: string[],
  variants: string[],
  config?: Partial<PackwizExecConfig>,
) => Promise<void> = async (modpack, targets, variants, conf) => {
  const config = buildConfig(conf ?? {});

  await new Promise<void>((resolve, reject) => {
    rmdir(join(config.cwd, "./bin"))
      .then(() => {
        packwizExportPacksHelper(modpack, targets, variants, config)
          .then(resolve)
          .catch(reject);
      })
      .catch(() => {
        packwizExportPacksHelper(modpack, targets, variants, config)
          .then(resolve)
          .catch(reject);
      });
  });
};
