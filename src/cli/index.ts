#!/usr/bin/env node

import { program } from "commander";
import { consola } from "consola";
import { description, name, version } from "../../package.json";
import { addCommand } from "./commands/add";
import { compileCommand } from "./commands/compile";
import { initCommand } from "./commands/init";
import { removeCommand } from "./commands/remove";

// Set name, desc, and vers from package.json
program.name(name).description(description).version(version);

/** The pack manifest file path. */
export const PACK_MANIFEST_FILE_PATH = "./pack.json";
/** Get the pack variant manifest file path. */
export const getPackVariantFilePath = (slug: string): string =>
  `./packs/${slug}.json`;

// Commands

// init CLI
program.addCommand(initCommand, { isDefault: true });

// compile CLI
program.addCommand(compileCommand);

// add CLI
program.addCommand(addCommand);

// remove CLI
program.addCommand(removeCommand);

// Pretty print errors

const displayUncaughtErrors = (cause: Error) => {
  consola.error(
    new Error(
      "An unexpected exception occured, and we don't know how to handle it.",
      {
        cause,
      },
    ),
  );
};

process.on("uncaughtException", displayUncaughtErrors);
process.on("unhandledRejection", displayUncaughtErrors);

// Init Commander
program.parse();
