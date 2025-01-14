import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { program } from "commander";

// Defaults

interface Config {
  /** If the program should be run in developer mode. Defaults to `false`. */
  dev: boolean;
  /** If using dev, where is Mkdocs' dev server expected to be? */
  devMkdocsServeHost: string;
}

export const defaultConfig: Config = {
  dev: false,
  devMkdocsServeHost: "http://localhost:8081",
};

// Create commander bindings

program.option("--dev", "Run the program in developer mode.");

// Load config file if it exists

const configFilePath = join(process.cwd(), "./config.json");

let fileConfig: Partial<Config> = {};

if (existsSync(configFilePath)) {
  fileConfig = JSON.parse(readFileSync(configFilePath, "utf-8"));
}

// Parse and Export

program.parse();

/** Crystal Ball configuration. */
export const config: Config = {
  ...defaultConfig,
  ...fileConfig,
  ...program.opts(),
};
