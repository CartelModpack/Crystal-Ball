import { Command } from "commander";
import { consola } from "consola";
import { getPackManifest, packwizCompilePacks } from "../../core";

// compile CLI

/** The `compile [variant]` command. */
export const compileCommand = new Command("compile")
  .command("compile")
  .description("Compile the modpack into packwiz packages.")
  .argument(
    "[string]",
    "The target game version to build for. If left blank will build for all targets specified in pack.json.",
  )
  .argument(
    "[string]",
    "The variant of the modpack to build. If left blank will build all variants avaliable.",
  )
  .action((target: string | undefined, variant: string | undefined) => {
    getPackManifest()
      .then((packManifest) => {
        if (variant && !packManifest.variants.includes(variant)) {
          throw new Error(`No variant called "${variant}" in pack.`);
        }

        if (target && !packManifest.targets.includes(target)) {
          throw new Error(`No target called "${target}" in pack.`);
        }

        consola.start(`Compiling to packwiz for...`);
        consola.start(
          ` - Game Versions: ${target ?? packManifest.targets.join(", ")}...`,
        );
        consola.start(
          ` - Variants: ${variant ?? packManifest.variants.join(", ")}...`,
        );

        packwizCompilePacks(
          variant ? [variant] : packManifest.variants,
          target ? [target] : packManifest.targets,
          packManifest,
        )
          .then(() => {
            consola.success("Packs compiled!");
          })
          .catch(consola.error);
      })
      .catch((error: Error) => {
        consola.error(error);
      });
  });
