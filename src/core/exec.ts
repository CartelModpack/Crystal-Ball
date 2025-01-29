import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { arg, execAll } from "../lib/exec";
import { stackObjects } from "../lib/obj";
import { getPackVarientFromSlug } from "./pack";

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
  return stackObjects<PackwizExecConfig>(
    {
      packwizPath: "packwiz",
      cwd: process.cwd(),
    },
    ...overrides,
  );
};

/** Helper function to generate a packwiz command. */
const generatePackwizCommand: (command: string, path: string) => string = (
  command,
  path,
) => {
  return `${path} ${command}`;
};

/** Helper function to compile a pack from a variant manifest. */
const compilePackFromManifest: (
  variant: PackVariantManifest,
  packManifest: PackManifest,
  config?: Partial<PackwizExecConfig>,
) => Promise<void> = async (variant, packManifest, conf) => {
  const { packwizPath, cwd } = buildConfig(conf ?? {});

  await new Promise<void>((resolve, reject) => {
    const displayName = `${packManifest.name} [${variant.name}]`;

    Promise.all(
      packManifest.targets.map((target) => {
        return new Promise<void>((resolve, reject) => {
          const commands: string[] = [
            generatePackwizCommand(
              `init --author ${arg(packManifest.author)} --mc-version ${arg(target)} --fabric-latest --name ${arg(packManifest.main === variant.slug ? packManifest.name : displayName)} --version ${arg(packManifest.version)} -r --modloader fabric -y`,
              packwizPath,
            ),
          ];

          const postCommands: string[] = [];

          for (const resource of variant.resources) {
            let cmd: string;

            if (resource.source === "url") {
              cmd = generatePackwizCommand(
                `${resource.source} add ${arg(resource.name)} ${arg(resource.url)} --meta-folder ${arg(resource.type)}`,
                packwizPath,
              );
            } else {
              cmd = generatePackwizCommand(
                `${resource.source} add ${arg(resource.id)} --meta-folder ${arg(resource.type)}`,
                packwizPath,
              );
            }

            commands.push(cmd);
          }

          commands.push(
            ...postCommands,
            generatePackwizCommand("refresh", packwizPath),
          );

          const binDir = join(cwd, "./bin", target, variant.slug);

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
      }),
    )
      .then(() => {
        resolve();
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
  config?: Partial<FSConfig>,
) => Promise<void> = async (variants, packManifest) => {
  await new Promise<void>((resolve, reject) => {
    Promise.all(variants.map((variant) => getPackVarientFromSlug(variant)))
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
