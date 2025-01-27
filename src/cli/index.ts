#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { program } from "commander";
import { description, name, version } from "../../package.json";

// Set name, desc, and vers from package.json
program.name(name).description(description).version(version);

// Commands

// init CLI command
program
  .command("init")
  .description("Initiates a new Crystal Ball project.")
  .argument(
    "[path]",
    "The path to create the project. If left blank uses the current directory.",
  )
  .action((path: string | null) => {
    const cwd: string =
      path === null ? process.cwd() : join(process.cwd(), path);

    mkdir(cwd, { recursive: true })
      .then(() => {
        console.info("Done!");
      })
      .catch((error: Error) => {
        throw error;
      });
  });

// Init Commander
program.parse();
