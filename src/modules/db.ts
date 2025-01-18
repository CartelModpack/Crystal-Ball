import bcrypt from "bcrypt";
import { Database } from "@gavinhsmith/simpledb";
// eslint-disable-next-line no-restricted-imports
import type { DataType } from "@gavinhsmith/simpledb/dist/module/lib/convert.js";
import { config } from "./config.js";

console.info("Loading database...");

const tables: { [key: string]: [{ [key: string]: DataType }, string] } = {
  modpacks: [
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
  ],
  auth: [
    {
      username: "string",
      key: "string",
    },
    "username",
  ],
};

export const db = Database(config.database, { verbose: config.verbose });

await new Promise<void>((resolve, reject) => {
  const tablePromises: Promise<void>[] = [];

  for (const table of Object.keys(tables)) {
    tablePromises.push(
      new Promise((resolve, reject) => {
        db.has(table)
          .then((exists) => {
            if (exists) {
              resolve();
            } else {
              db.create(table, tables[table][0], tables[table][1])
                .then(() => {
                  resolve();
                })
                .catch(reject);
            }
          })
          .catch(reject);
      }),
    );
  }

  Promise.all(tablePromises)
    .then(() => {
      db.table("auth")
        .add({
          username: "admin",
          key: bcrypt.hashSync("admin", 10),
        })
        .then(() => {
          console.info("Database loaded!");
          resolve();
        })
        .catch(reject);
    })
    .catch(reject);
});
