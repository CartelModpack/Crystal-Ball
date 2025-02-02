import { mkdir } from "node:fs/promises";
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
