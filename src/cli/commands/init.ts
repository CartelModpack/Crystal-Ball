import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Command } from "commander";
import { consola } from "consola";
import { PACK_MANIFEST_FILE_PATH, sanitizeForFiles } from "..";

// init CLI

/** `init` command config. */
interface InitCLIConfig {
  name: string;
  description: string;
  version: string;
  author: string;
  slug?: string;
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
    "The version of the pack. If left blank will be defined interactively.",
  )
  .option(
    "-a, --author <string>",
    "The author of the pack. If left blank will be defined interactively.",
  )
  .option(
    "--slug <string>",
    "The slug ID of the pack. If left blank will be derived from the name.",
  )
  .action((path: string | null, cliOpts: Partial<InitCLIConfig>) => {
    // Get the "cwd" of the new project.
    const cwd: string =
      path === null ? process.cwd() : join(process.cwd(), path);

    // Make the directory if it doesn't already exist.
    mkdir(join(cwd, "./packs"), { recursive: true })
      .then(() => {
        // Check that a pack doesnt already exist here.
        access(join(cwd, PACK_MANIFEST_FILE_PATH))
          .then(() => {
            consola.error(new Error("Modpack manifest already exists here."));
          })
          .catch(async () => {
            // Get any missing CLI options we need.
            const opts = cliOpts as InitCLIConfig;

            const requiredOpts: (keyof InitCLIConfig)[] = [
              "name",
              "description",
              "version",
              "author",
            ];

            for (const key of requiredOpts) {
              if (cliOpts[key] === undefined) {
                opts[key] = await consola.prompt(
                  `${key === "author" ? "Who" : "What"} is the modpack's ${key}?`,
                  {
                    type: "text",
                    default: key === "version" ? "1.0.0" : undefined,
                  },
                );
                opts[key] = opts[key].trim();
              } else {
                opts[key] = cliOpts[key];
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
            packManifest.variants = {
              main: "./packs/main.json",
            };

            // Save pack manifest
            writeFile(
              join(cwd, PACK_MANIFEST_FILE_PATH),
              JSON.stringify(packManifest, null, 2),
              "utf-8",
            )
              .then(() => {
                // Create main pack variant.
                const mainPackVariant: PackVariantManifest = {
                  name: "Main",
                  slug: "main",
                  inherits: null,
                  resources: [],
                };

                // Save main pack variant.
                writeFile(
                  join(cwd, "./packs/main.json"),
                  JSON.stringify(mainPackVariant, null, 2),
                  "utf-8",
                )
                  .then(() => {
                    consola.success(
                      `Modpack "${(packManifest as PackManifest).name}" created! Use crystal-ball help for utility commands.`,
                    );
                  })
                  .catch((error: Error) => {
                    consola.error(error);
                  });
              })
              .catch((error: Error) => {
                consola.error(error);
              });
          });
      })
      .catch((error: Error) => {
        consola.error(error);
      });
  });
