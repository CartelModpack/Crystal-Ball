import { Command } from "commander";
import { consola } from "consola";
import { exportModpackToFS, importModpackFromFS } from "../fs";

// remove CLI

/** The `remove <name> [variant]` command. */
export const removeCommand = new Command("remove")
  .description("Removes a resource from the modpack.")
  .argument("<name>", "The name of the resource")
  .argument(
    "[variant]",
    "The variant to remove this from. Defaults to the main variant if it exists.",
  )
  .action((name: string, variant: string | undefined) => {
    importModpackFromFS(process.cwd())
      .then((modpack) => {
        const variantInst = modpack.getVariant(
          variant ?? modpack.manifest.main,
        );

        if (variantInst === null) {
          consola.error(
            new Error(
              `No removable variant found. (${String(variant ?? modpack.manifest.main)})`,
            ),
          );

          return;
        }

        variantInst.removeResource(name);

        modpack
          .export(exportModpackToFS(process.cwd()))
          .then(() => {
            consola.info(`Removed resource "${name}".`);
          })
          .catch(consola.error);
      })
      .catch(consola.error);
  });
