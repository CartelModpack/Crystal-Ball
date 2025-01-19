import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { program } from "commander";
import { omit } from "./tools.js";

console.info("Loading config...");

// Definitions

type BaseConfig = {
  /** If the server should run in verbose mode. Defaults to `false`. */
  verbose: boolean;
  /** The database file to use, relative to working directory. Defaults to `data.db`. */
  database: string;
  /** The port to host the server on. */
  port: number;
  /** Secret for the JWT secret for API keys. */
  jwt: string;
};

type DevConfig = {
  /** If the program should be run in developer mode. Defaults to `false`. */
  dev: true;
  /** If using dev, what port is the `mkdocs` dev server running on. */
  devDocsPort: number;
} & BaseConfig;

type ProdConfig = {
  /** If the program should be run in developer mode. Defaults to `false`. */
  dev: false;
} & BaseConfig;

/** The config type bindings. */
type Config = ProdConfig | DevConfig;

// Defaults

/** A random key for JWT tokens. */
const randomToken = randomBytes(64).toString("hex");

/** All required items (for schema). */
export const requiredConfigProps: (keyof DevConfig)[] = ["port"];
/** All items that require other options. */
export const dependentConfigProps: {
  [P in keyof Partial<DevConfig>]: (keyof DevConfig)[];
} = {
  devDocsPort: ["dev"],
};

/** The default config. */
export const defaultConfig: Config = {
  dev: false,

  verbose: false,
  database: "data.db",
  port: process.env.NODE_ENV === "production" ? 80 : 8080,
  jwt: randomToken,
};

/** The default dev config. */
export const defaultDevConfig: Config = {
  ...defaultConfig,
  dev: true,
  devDocsPort: 8081,
};

// Create Commander Bindings

// Dont bind dev bindings if we are running in a production environment. We dont need it.
if (process.env.NODE_ENV !== "production") {
  program.option("-d, --dev", "Run the program in developer mode.");
  program.option(
    "--dev-docs-port <number>",
    "If using dev, what port has the MkDocs dev server. ",
  );
}

program.option("--database <string>", "A custom database file to use.");
program.option("-p, --port <number>", "The port to run the server on.");
program.option("-v, --verbose", "Run in verbose mode.");

// Load Config File

const configFilePath = join(process.cwd(), "./config.json");

/**
 * (Re)loads the config from config.json.
 *
 * @returns A config object.
 */
const loadFileConfig: () => Partial<Config> = () => {
  if (existsSync(configFilePath)) {
    try {
      return JSON.parse(
        readFileSync(configFilePath, "utf-8"),
      ) as Partial<Config>;
    } catch (error) {
      console.warn("Could not load config.json!");
      console.debug(error);

      return {};
    }
  } else {
    // Create config if it doesnt exist, and load into file.
    writeFileSync(
      configFilePath,
      JSON.stringify(
        {
          $schema: "http://localhost:8080/api/v1/schema/options",
          ...omit(defaultConfig, "dev"),
        },
        null,
        2,
      ), // Dev doesnt need to be displayed at all, unless specified.
    );

    console.info("Created config.json!");

    return omit(defaultConfig, "dev");
  }
};

/** Currently loaded file config. */
let fileConfig = loadFileConfig();

// Parse and Export

program.parse();

/** Get Crystal Ball's current configuration. */
export const config: () => Config = () => {
  return {
    ...defaultConfig,
    ...fileConfig,
    ...program.opts(),
  };
};

// Reloads and hooks

type ConfigEventHandler = (config: Config) => Promise<void>;

/** All reload events  */
const eventHooksReload: ConfigEventHandler[] = [];

/**
 * Execute something when the config is reload.
 *
 * @param handler - A method to execute on a config reload.
 */
export const ifConfigReloaded = (handler: ConfigEventHandler): void => {
  eventHooksReload.push(handler);
};

/** Reload all config that could be reloaded. */
export const reloadConfig: () => Promise<void> = async () => {
  fileConfig = loadFileConfig();

  for (const handler of eventHooksReload) {
    await handler(config());
  }
};
