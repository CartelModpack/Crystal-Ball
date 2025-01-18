import { Database } from "@gavinhsmith/simpledb";
import { config } from "./config.js";

console.info("Loading database...");

export const db = Database(config.database, { verbose: config.verbose });

await new Promise<void>((resolve, reject) => {
  db.has("modpacks")
    .then((exists) => {
      if (exists) {
        console.info("Database loaded.");
        resolve();
      } else {
        db.create(
          "modpacks",
          {
            slug: "string",
            inherits: "string",
            supportedVersions: "string",
            mods: "string",
            resources: "string",
            shaders: "string",
            configs: "string",
          },
          "slug",
        )
          .then(() => {
            console.info("Database loaded.");
            resolve();
          })
          .catch(reject);
      }
    })
    .catch(reject);
});
