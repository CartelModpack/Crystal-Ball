import bcrypt from "bcrypt";
import { runAtShutdown } from "@gavinhsmith/shutdown";
import { Database } from "@gavinhsmith/simpledb";
// eslint-disable-next-line no-restricted-imports
import type { DataType } from "@gavinhsmith/simpledb/dist/module/lib/convert.js";
import type { User } from "./auth.js";
import { config, ifConfigReloaded } from "./config.js";

console.info("Loading database...");

// Preloads
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
        database
          .table<User>("auth")
          .get(["username"], (row) => row.username === "admin")
          .then((rows) => {
            if (rows.length > 0) {
              console.info("Database loaded!");
              resolve();
            } else {
              database
                .table("auth")
                .add({
                  username: "admin",
                  key: bcrypt.hashSync("admin", 10),
                })
                .then(() => {
                  console.info("Database loaded!");
                  resolve();
                })
                .catch(reject);
            }
          })
          .catch(reject);
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
