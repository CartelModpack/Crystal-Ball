#!/usr/bin/env node

import http from "node:http";
import { program } from "commander";
import express from "express";
import { init as initShutdown, runAtShutdown } from "@gavinhsmith/shutdown";
import { config, ifConfigReloaded } from "./modules/config.js";
import { errorHandler } from "./modules/error.js";
import { apiRoutes } from "./routes/api/api.js";
import { webRoutes } from "./routes/web.js";

// Inits

initShutdown();

// Express

const app = express();

app.use("/api", apiRoutes);
app.use("/", webRoutes);

app.use(errorHandler);

// Server

// Typescript when you want to use express:
const server = http.createServer(app as unknown as undefined);

server.listen(config().port, () => {
  const flags: string[] = [];

  for (const opt of Object.keys(program.opts())) {
    flags.push(opt);
  }

  console.info(
    `Started server on port *:${String(config().port)}. Flags: ${flags.join(", ")}`,
  );
});

// Run on shutdown
runAtShutdown("http", async () => {
  await new Promise<void>((resolve) => {
    server.close((error) => {
      if (error) {
        console.warn(error);
      }

      resolve();
    });
  });
});

// Restart if config is reloaded.
ifConfigReloaded(async (conf) => {
  console.info(`Restarting server...`);
  await new Promise<void>((done) => {
    server.close((error) => {
      if (error) {
        console.warn(error);
      }

      server.listen(conf.port, () => {
        console.info(`Started restarted on port *:${String(conf.port)}.`);
        done();
      });
    });
  });
});

process.on("uncaughtException", console.error);
