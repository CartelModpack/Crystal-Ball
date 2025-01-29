import { Command } from "commander";
import { consola } from "consola";
import { getPackManifest, packwizCompilePacks } from "../../core";

// compile CLI

/** The `compile [variant]` command. */
export const compileCommand = new Command("compile")
  .command("compile")
  .description("Compile the modpack into packwiz packages.")
  .argument(
    "[variant]",
    "The variant of the modpack to build. If left blank will build all variants avaliable.",
  )
  .action((variant: string | undefined) => {
    getPackManifest()
      .then((packManifest) => {
        if (variant && !packManifest.variants.includes(variant)) {
          throw new Error(`No variant called "${variant}" in pack.`);
        }

        consola.start("Compiling to packwiz...");

        packwizCompilePacks(
          variant ? [variant] : packManifest.variants,
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
