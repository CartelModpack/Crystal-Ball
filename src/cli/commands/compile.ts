import { Command } from "commander";
import { consola } from "consola";
import { packwizCompilePacks } from "../../core";
import { importModpackFromFS } from "../fs";

// compile CLI

/** The `compile [variant]` command. */
export const compileCommand = new Command("compile")
  .command("compile")
  .description("Compile the modpack into packwiz packages.")
  .argument(
    "[version]",
    "The target game version to build for. If left blank will build for all targets specified in pack.json.",
  )
  .argument(
    "[variant]",
    "The variant of the modpack to build. If left blank will build all variants avaliable.",
  )
  .action((target: string | undefined, variant: string | undefined) => {
    importModpackFromFS(process.cwd())
      .then((modpack) => {
        if (variant && !modpack.manifest.variants.includes(variant)) {
          throw new Error(`No variant called "${variant}" in pack.`);
        }

        if (target && !modpack.manifest.targets.includes(target)) {
          throw new Error(`No target called "${target}" in pack.`);
        }

        consola.start(`Compiling to packwiz for...`);
        consola.start(
          ` - Game Versions: ${target ?? modpack.manifest.targets.join(", ")}...`,
        );
        consola.start(
          ` - Variants: ${variant ?? modpack.manifest.variants.join(", ")}...`,
        );

        packwizCompilePacks(
          variant ? [variant] : modpack.manifest.variants,
          target ? [target] : modpack.manifest.targets,
          modpack,
          { cwd: process.cwd(), packwizPath: modpack.manifest.packwiz },
        )
          .then(() => {
            consola.success("Packs compiled!");
          })
          .catch(consola.error);
      })
      .catch(consola.error);
  });
