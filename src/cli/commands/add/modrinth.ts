import { consola } from "consola";
import { fetchData } from "../../../lib/fetch";
import { exportModpackToFS, importModpackFromFS } from "../../fs";
import {
  type AddCLIFlags,
  createBaseAddCommand,
  verifyResourceType,
} from "./base";

interface ModrinthProject {
  title: string;
  id: string;
  slug: string;
  project_type: string;
  game_versions: string[];
  loaders: string[];
}

// `add modrinth` CLI

/** CLI command `add modrinth [flags] <id-slug> [name]`. */
export const addModrinthCommand = createBaseAddCommand("modrinth", "Modrinth")
  .argument("<id-slug>", "The project ID or slug of the resource.")
  .argument("[name]", "The name of the resource.")
  .action(
    (id: string, name: string | undefined, opts: Partial<AddCLIFlags>) => {
      // Import the modpack from the current folder.
      importModpackFromFS(process.cwd())
        .then((modpack) => {
          fetchData<ModrinthProject>(
            `https://api.modrinth.com/v2/project/${id}`,
            "",
          )
            .then((modrinthResource) => {
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

              if (
                !verifyResourceType(opts.type ?? modrinthResource.project_type)
              ) {
                consola.error(
                  new Error(`Invalid resource type. ${String(opts.type)}`),
                );

                return;
              }

              consola.start(
                `Adding resource "${name ?? modrinthResource.title}"...`,
              );

              variant.addResource({
                source: "modrinth",
                type:
                  opts.type ??
                  (modrinthResource.project_type as PackResourceType),
                name: name ?? modrinthResource.slug,
                id: modrinthResource.id,
              });

              modpack
                .export(exportModpackToFS(process.cwd()))
                .then(() => {
                  consola.success("Added resource!");
                })
                .catch((error) => {
                  consola.error(error);
                });
            })
            .catch((error) => {
              consola.error(
                new Error(`Couldn't add resource "${id}".`, {
                  cause: error,
                }),
              );
            });
        })
        .catch((error: Error) => {
          consola.error(error);
        });
    },
  );
