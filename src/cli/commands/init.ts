import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import { consola } from "consola";
import { fetchData } from "../../lib/fetch";
import { PACK_MANIFEST_FILE_PATH, sanitizeForFiles } from "..";
import { prompt } from "../prompt";

// init CLI

const getLatestFabricMinecraftVers = async (): Promise<string> => {
  return await new Promise((resolve, reject) => {
    fetchData<{ version: string; stable: boolean }[]>(
      "https://meta.fabricmc.net/v2/versions/game",
      "",
      (val) => val.stable,
    )
      .then((stable) => {
        consola.debug(stable);
        if (stable[0]) {
          resolve(stable[0].version);
        } else {
          reject(
            new Error(
              "FabricMC does not have a highest stable version? This error should not happen, please contact the mantainer.",
            ),
          );
        }
      })
      .catch(reject);
  });
};

/** `init` command config. */
interface InitCLIConfig {
  name: string;
  description: string;
  version: string;
  author: string;
  slug?: string;
  targets?: string;
  dryRun?: string;
}

/** The `init [path] [flags]` command. */
export const initCommand = new Command("init")
  .description("Initiates a new Crystal Ball project.")
  .argument(
    "[path]",
    "The path to create the project. If left blank uses the current directory.",
  )
  .option(
    "-n, --name <string>",
    "The name of the pack. If left blank will be defined interactively.",
  )
  .option(
    "-d, --description <string>",
    "The description of the pack. If left blank will be defined interactively.",
  )
  .option(
    "-v, --version <string>",
    "The version of the pack. If left blank will be defined interactively. Defaults to 1.0.0",
  )
  .option(
    "-a, --author <string>",
    "The author of the pack. If left blank will be defined interactively.",
  )
  .option(
    "-t, --targets <string...>",
    "A list of game versions to compile to. If left blank will defined interactively. Defaults to the latest version of Minecraft supported by Fabric.",
  )
  .option(
    "-s, --slug <string>",
    "The slug ID of the pack. If left blank will be derived from the name.",
  )
  .action(async (path: string | undefined, cliOpts: Partial<InitCLIConfig>) => {
    // Get the "cwd" of the new project.
    const cwd: string =
      path === undefined ? process.cwd() : join(process.cwd(), path);

    // Make the directory if it doesn't already exist.
    if (!cliOpts.dryRun) {
      mkdirSync(join(cwd, "./packs"), { recursive: true });
    }

    // Check a pack isn't already here.
    if (existsSync(join(cwd, PACK_MANIFEST_FILE_PATH)) && !cliOpts.dryRun) {
      consola.error(new Error("Modpack manifest already exists here."));

      return;
    }

    // Get the latest version of fabric if cliOpts doesnt have a target paramater.
    const latestFabricMcVers = cliOpts.targets
      ? undefined
      : await getLatestFabricMinecraftVers();

    // Get any missing CLI options we need.
    const opts = cliOpts as InitCLIConfig;

    const requiredOpts: (keyof InitCLIConfig)[] = [
      "name",
      "description",
      "version",
      "author",
      "targets",
    ];

    for (const key of requiredOpts) {
      if (cliOpts[key] === undefined) {
        let defaultVal: string | undefined = undefined;

        switch (key) {
          case "version": {
            defaultVal = "1.0.0";
            break;
          }
          case "targets": {
            defaultVal = latestFabricMcVers;
            break;
          }
          default: {
            break;
          }
        }

        const defaultValStr = ` [${defaultVal ?? ""}]`;

        try {
          opts[key] = (await prompt(
            `${key === "author" ? "Who" : "What"} is the modpack's ${key}${defaultVal ? defaultValStr : ""}:`,
            {
              retries: -1,
              default: defaultVal,
              postprocess: async (val): Promise<string> => {
                return await new Promise((resolve, reject) => {
                  if (val === undefined) {
                    reject(new Error(`Modpack must have ${key}.`));
                  } else {
                    resolve(val);
                  }
                });
              },
            },
          )) as string;

          opts[key] = opts[key].trim();
        } catch (error) {
          consola.error(error);
          process.exit(1);
        }
      } else {
        if (Array.isArray(cliOpts[key])) {
          opts[key] = cliOpts[key].join(",");
        } else {
          opts[key] = cliOpts[key];
        }
      }
    }

    consola.start("Creating modpack files...");

    // Build pack manifest.
    const packManifest: Partial<PackManifest> = {};

    packManifest.name = opts.name;
    packManifest.slug = sanitizeForFiles(opts.slug ?? opts.name);
    packManifest.description = opts.description;
    packManifest.author = opts.author;
    packManifest.version = opts.version;
    packManifest.main = "main";
    packManifest.variants = ["main"];
    packManifest.targets = opts.targets?.replaceAll(" ", "").split(",") ?? [
      latestFabricMcVers ?? "N/A",
    ];

    if (!cliOpts.dryRun) {
      // Create pack.json
      writeFileSync(
        join(cwd, PACK_MANIFEST_FILE_PATH),
        JSON.stringify(packManifest, null, 2),
        "utf-8",
      );
    }

    // Create main pack variant.
    const mainPackVariant: PackVariantManifest = {
      name: "Main",
      slug: "main",
      inherits: null,
      resources: [],
    };

    // Save main pack variant.
    if (!cliOpts.dryRun) {
      writeFileSync(
        join(cwd, "./packs/main.json"),
        JSON.stringify(mainPackVariant, null, 2),
        "utf-8",
      );
    }

    consola.success(
      `Modpack "${(packManifest as PackManifest).name}" created! Use crystal-ball help for utility commands.`,
    );
  });

// Add any non-production commands.
if (process.env.NODE_ENV !== "production") {
  initCommand.option("--dry-run", "[DEV] Prevent file exist checks");
}
