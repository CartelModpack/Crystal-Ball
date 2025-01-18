import { join } from "node:path";
import { Router, static as staticFolder } from "express";
import { config } from "../modules/config.js";

export const webRoutes = Router();

if (config.dev) {
  webRoutes.use((req, res) => {
    res.redirect(`${config.devDocsServer}${req.path}`);
  });
} else {
  webRoutes.use(staticFolder(join(process.cwd(), "./site")));
}
