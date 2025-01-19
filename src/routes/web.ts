import { readFile } from "node:fs";
import { join } from "node:path";
import { Router, static as staticFolder } from "express";
import { config } from "../modules/config.js";

export const webRoutes = Router();

webRoutes.use(staticFolder(join(process.cwd(), "./site")));

webRoutes.use((req, res) => {
  const conf = config();

  if (conf.dev) {
    res.redirect(`http://localhost:${String(conf.devDocsPort)}${req.path}`);
  } else {
    readFile(join(process.cwd(), "./site/404.html"), "utf-8", (error, data) => {
      res.status(404);
      res.header("Content-Type", "text/html");
      res.send(data);
      res.end();
    });
  }
});
