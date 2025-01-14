import express from "express";
import { apiRoutes } from "./routes/api.js";
import { schemaRoute } from "./routes/schema.js";
import { webRoutes } from "./routes/web.js";

const app = express();

app.use("/schema", schemaRoute);
app.use("/api", apiRoutes);
app.use("/", webRoutes);

app.listen(8080);
