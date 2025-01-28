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
    consola.start("Compiling to packwiz...");
    getPackManifest()
      .then((packManifest) => {
        packwizCompilePacks(
          variant
            ? [packManifest.variants[variant]]
            : Object.values(packManifest.variants),
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
