import bcrypt from "bcrypt";
import { runAtShutdown } from "@gavinhsmith/shutdown";
import { Database } from "@gavinhsmith/simpledb";
// eslint-disable-next-line no-restricted-imports
import type { DataType } from "@gavinhsmith/simpledb/dist/module/lib/convert.js";
import { config, ifConfigReloaded } from "./config.js";

console.info("Loading database...");

// Tables
const tables: { [key: string]: [{ [key: string]: DataType }, string] } = {
  modpacks: [
    {
      name: "string",
      slug: "string",
      version: "int",
      author: "string",
      inherits: "string",
      supportedMCVersions: "string",
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
      permissions: "int",
      key: "string",
    },
    "username",
  ],
};

// Preloads
const preloads: { [key: string]: { [key: string]: unknown } | undefined } = {
  auth: {
    username: "admin",
    permissions: 1,
    key: bcrypt.hashSync("admin", 10),
  },
};

const loadDB = async () => {
  const database = Database(config().database, { verbose: config().verbose });

  await new Promise<void>((resolve, reject) => {
    const tablePromises: Promise<void>[] = [];

    for (const table of Object.keys(tables)) {
      tablePromises.push(
        new Promise((resolve, reject) => {
          database
            .has(table)
            .then((exists) => {
              if (exists) {
                resolve();
              } else {
                database
                  .create(table, tables[table][0], tables[table][1])
                  .then(() => {
                    if (preloads[table] === undefined) {
                      resolve();
                    } else {
                      database
                        .table<{ [key: string]: string }>(table)
                        .add(preloads[table] as { [key: string]: string })
                        .then(() => {
                          resolve();
                        })
                        .catch(reject);
                    }
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
        console.info("Database loaded!");
        resolve();
      })
      .catch(reject);
  });

  return database;
};

export let db = await loadDB();

ifConfigReloaded(async () => {
  await new Promise<void>((done) => {
    console.info("Reloading database...");
    db.close()
      .then(() => {
        loadDB()
          .then((newDb) => {
            db = newDb;
            done();
          })
          .catch((error) => {
            console.error(error);
            done();
            process.exit(1);
          });
      })
      .catch((error) => {
        console.error(error);
        done();
        process.exit(1);
      });
  });
});

runAtShutdown("db", async () => {
  await db.close();
});
