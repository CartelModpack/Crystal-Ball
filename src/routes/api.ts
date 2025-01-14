import { Router } from "express";

export const apiRoutes = Router();

apiRoutes.get("/", (req, res) => {
  res.status(200);
  res.header("Content-Type", "application/json");
  res.send({});
  res.end();
});
