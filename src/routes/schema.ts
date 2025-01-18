import { type Request, type Response, Router } from "express";
import { run } from "../../lib/json_typegen_wasm/json_typegen_wasm.js";
import packageFile from "../../package.json" with { type: "json" };
import { defaultConfig } from "../modules/config.js";

export const schemaRoute = Router();

const schemaGenerator = (
  req: Request & { params: { output: string | null } },
  res: Response,
) => {
  const outputMode = req.params.output ?? "json_schema";

  const { name } = packageFile;

  try {
    const content = JSON.parse(
      run(
        name,
        JSON.stringify(defaultConfig),
        JSON.stringify({ output_mode: outputMode }),
      ),
    );

    res.status(200);
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(content, null, 2));
    res.end();
  } catch (error) {
    res.status(400);
    res.header("Content-Type", "text/plain");
    res.send(`Invalid type ${outputMode}. Error: ${String(error)}`);
    res.end();
  }
};

schemaRoute.get("/options/:output", schemaGenerator);
schemaRoute.get("/options", schemaGenerator);
