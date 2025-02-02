import { basename } from "node:path";
import { consola } from "consola";
import { exportModpackToFS, importModpackFromFS } from "../../fs";
import {
  type AddCLIFlags,
  createBaseAddCommand,
  verifyResourceType,
} from "./base";

export const addURLCommand = createBaseAddCommand("url", "URL")
  .argument("<url>", "The URL of the resource.")
  .argument("[name]", "The name of the resource.")
  .action(
    (url: string, name: string | undefined, opts: Partial<AddCLIFlags>) => {
      importModpackFromFS(process.cwd())
        .then((modpack) => {
          const variant = modpack.getVariant(
            opts.variant ?? modpack.manifest.main,
          );

          if (variant === null) {
            consola.error(
              new Error(
                `No usable variant found. (${String(opts.variant ?? modpack.manifest.main)})`,
              ),
            );

            return;
          }

          if (!verifyResourceType(opts.type ?? "mod")) {
            consola.error(
              new Error(`Invalid resource type. ${String(opts.type)}`),
            );

            return;
          }

          const parsedUrl = URL.parse(url)?.pathname;
          const generatedName = basename(parsedUrl ?? "")
            .split(".")
            .slice(0, -1)
            .join(".");

          if (!parsedUrl && !name) {
            throw new Error(
              "Can't derive name from url. Please specify the name.",
            );
          }

          consola.start(`Adding resource "${name ?? generatedName}"...`);

          variant.addResource({
            source: "url",
            type: opts.type ?? "mod",
            name: name ?? generatedName,
            url,
          });

          modpack
            .export(exportModpackToFS(process.cwd()))
            .then(() => {
              consola.success("Added resource!");
            })
            .catch(consola.error);
        })
        .catch(consola.error);
    },
  );
