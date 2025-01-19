import { readFile } from "node:fs";
import { join } from "node:path";
import { Router, static as staticFolder } from "express";
import { config } from "../modules/config.js";

export const webRoutes = Router();

webRoutes.use((req, res, next) => {
  const conf = config();

  if (conf.dev) {
    console.debug(
      `Redirecting to http://localhost:${String(conf.devDocsPort)}${req.path}`,
    );
    res.redirect(`http://localhost:${String(conf.devDocsPort)}${req.path}`);
  } else {
    next();
  }
});

webRoutes.use(staticFolder(join(process.cwd(), "./site")));

webRoutes.use((req, res) => {
  readFile(join(process.cwd(), "./site/404.html"), "utf-8", (error, data) => {
    res.status(404);
    res.header("Content-Type", "text/html");
    res.send(data);
    res.end();
  });
});
