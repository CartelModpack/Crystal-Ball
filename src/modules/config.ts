import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { program } from "commander";

console.info("Loading config...");

// Defaults

interface Config {
  /** If the program should be run in developer mode. Defaults to `false`. */
  dev: boolean;
  /** If the server should run in verbose mode. Defaults to `false`. */
  verbose: boolean;
  /** If using dev, where is Mkdocs' dev server expected to be. */
  devDocsServer: string;
  /** The database file to use, relative to working directory. Defaults to `data.db`. */
  database: string;
  /** The port to host the server on. */
  port: 8080;
  /** Secret for the JWT secret for API keys. */
  jwt: string;
}

/** The default config file. */
export const defaultConfig: Config = {
  dev: false,
  verbose: false,
  devDocsServer: "http://localhost:8081",
  database: "data.db",
  port: 8080,
  jwt: randomBytes(64).toString("hex"),
};

// Create commander bindings

program.option("-d, --dev", "Run the program in developer mode.");
program.option(
  "--dev-docs-server <string>",
  "If using dev, where is the MkDocs dev server. ",
);
program.option("--database <string>", "A custom database file to use.");
program.option("-p, --port <number>", "The port to run the server on.");
program.option("-v, --verbose", "Run in verbose mode.");

// Load config file if it exists

const configFilePath = join(process.cwd(), "./config.json");

let fileConfig: Partial<Config> = {};

if (existsSync(configFilePath)) {
  try {
    fileConfig = JSON.parse(readFileSync(configFilePath, "utf-8"));
  } catch (error) {
    console.warn("Could not load config.json!");
    console.warn(error);
  }
} else {
  writeFileSync(configFilePath, JSON.stringify(defaultConfig, null, 2));
  console.info("Created config.json!");
}

// Parse and Export

program.parse();

/** Crystal Ball configuration. */
export const config: Config = {
  ...defaultConfig,
  ...fileConfig,
  ...program.opts(),
};
