import { Command } from "commander";
import { consola } from "consola";
import { packwizExportPacks } from "../../core/exec";
import { importModpackFromFS } from "../fs";

export const exportCommand = new Command("export")
  .description("Export packs to Curseforge, Modrinth, etc from compiled packs.")
  .argument(
    "[target]",
    "The target game version to export for. If left blank will export for all targets specified in pack.json.",
  )
  .argument(
    "[variant]",
    "The variant of the modpack to export. If left blank will export all variants avaliable.",
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

        consola.start(`Exporting for...`);
        consola.start(
          ` - Game Versions: ${target ?? modpack.manifest.targets.join(", ")}...`,
        );
        consola.start(
          ` - Variants: ${variant ?? modpack.manifest.variants.join(", ")}...`,
        );

        packwizExportPacks(
          modpack,
          target ? [target] : modpack.manifest.targets,
          variant ? [variant] : modpack.manifest.variants,
          { cwd: process.cwd(), packwizPath: modpack.manifest.packwiz },
        )
          .then(() => {
            consola.success("Packs exported!");
          })
          .catch(consola.error);
      })
      .catch(consola.error);
  });
