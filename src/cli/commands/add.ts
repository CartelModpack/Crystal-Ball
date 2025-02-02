import { Command } from "commander";
import { addModrinthCommand } from "./add/modrinth";
import { addURLCommand } from "./add/url";

// add CLI

/** The `add [flags] <source> <path> [name]` command. */
export const addCommand = new Command("add")
  .description("Adds a new resource to the modpack.")
  .addCommand(addURLCommand)
  .addCommand(addModrinthCommand);
