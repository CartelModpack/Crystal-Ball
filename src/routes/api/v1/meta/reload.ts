import { Router } from "express";
import { reloadConfig } from "../../../../modules/config.js";

export const apiMetaReloadV1Route = Router();

apiMetaReloadV1Route.get("/reload", (req, res) => {
  res.status(200);
  res.header("Content-Type", "text/plain");
  res.send("OK");
  res.end();

  // Dont ever do this, ever. just for temp.
  reloadConfig().catch(console.debug).catch(console.error);
});
