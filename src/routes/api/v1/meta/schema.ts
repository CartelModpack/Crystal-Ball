import { type Request, type Response, Router } from "express";
import { run } from "../../../../../lib/json_typegen_wasm/json_typegen_wasm.js";
import packageFile from "../../../../../package.json" with { type: "json" };
import { APIError, sendAPIResponse } from "../../../../modules/api.js";
import {
  config,
  defaultDevConfig,
  dependentConfigProps,
  requiredConfigProps,
} from "../../../../modules/config.js";

export const schemaAPIv1Route = Router();

type SchemaLike = {
  $id: string;
  title: string;
  required: string[];
  dependencies: { [key: string]: string[] };
};

const schemaGenerator = (
  title: string,
  required: string[],
  dependencies: { [key: string]: string[] },
) => {
  return (
    req: Request & { params: { output: string | null } },
    res: Response,
  ) => {
    const outputMode = req.params.output ?? "json_schema";

    const { name } = packageFile;

    try {
      const content: SchemaLike = JSON.parse(
        run(
          name,
          JSON.stringify(defaultDevConfig),
          JSON.stringify({ output_mode: outputMode }),
        ),
      );

      content.title = title;
      content.$id = `${req.protocol}://${req.hostname}:${String(config().port)}${req.originalUrl.split("?")[0]}`;
      content.required = required;
      content.dependencies = dependencies;

      sendAPIResponse(res, content);
    } catch (error) {
      throw new APIError(400, `Invalid type ${outputMode}`, error as Error);
    }
  };
};

schemaAPIv1Route.get(
  "/options/:output",
  schemaGenerator(
    "Crystal Ball Config File",
    requiredConfigProps,
    dependentConfigProps,
  ),
);
schemaAPIv1Route.get(
  "/options",
  schemaGenerator(
    "Crystal Ball Config File",
    requiredConfigProps,
    dependentConfigProps,
  ),
);
