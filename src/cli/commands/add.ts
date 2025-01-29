import { Command } from "commander";

// add CLI

/** The `add [flags] <source> <path> [name] [type]` command. */
export const addCommand = new Command("add").description(
  "Adds a new resource to the modpack.",
);
