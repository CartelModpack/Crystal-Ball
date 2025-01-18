#!/usr/bin/env node

import express from "express";
import { config } from "./modules/config.js";
import { apiRoutes } from "./routes/api.js";
import { schemaRoute } from "./routes/schema.js";
import { webRoutes } from "./routes/web.js";

const app = express();

app.use("/schema", schemaRoute);
app.use("/api", apiRoutes);
app.use("/", webRoutes);

app.listen(config.port);

console.info(`Started server on port *:${String(config.port)}.`);
