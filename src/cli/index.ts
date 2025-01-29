#!/usr/bin/env node

import { program } from "commander";
import { description, name, version } from "../../package.json";
import { addCommand } from "./commands/add";
import { compileCommand } from "./commands/compile";
import { initCommand } from "./commands/init";

// Set name, desc, and vers from package.json
program.name(name).description(description).version(version);

// Tools

/** Sanitize a string for use in the filesystem. */
export const sanitizeForFiles: (string: string) => string = (str) => {
  return str
    .trim()
    .toLowerCase()
    .replaceAll(/[ /\\?%*:|"<>\0]/g, "");
};

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

// Init Commander
program.parse();
