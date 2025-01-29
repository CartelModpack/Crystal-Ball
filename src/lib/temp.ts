import { mkdir, rmdir } from "node:fs/promises";
import { join } from "node:path";

/** Config for temp folder. */
interface TempFolderOptions {
  /** The ID or ID Generation function to use. Defaults to a random id. */
  id: string | (() => string);
  /** How many milliseconds after all then handlers execute should the folder persist. Defaults to `0`. */
  persist: number;
}

/** The default options. */
const DEFAULT_OPTIONS: TempFolderOptions = {
  id: () => Math.floor(Math.random() * 10 * Date.now()).toString(16),
  persist: 0,
};

/** Helper to make folder. */
const makeTempFolder: (id: string) => Promise<string> = (id) => {
  const tmp = join(process.cwd(), `./temp/${id}`);

  return new Promise((resolve, reject) => {
    mkdir(tmp, { recursive: true })
      .then(() => {
        resolve(tmp);
      })
      .catch(reject);
  });
};

type TempFolderCallback = (
  error: Error | null,
  wd: string | null,
) => void | PromiseLike<void>;

/**
 * Create a temp folder that will delete when operations are complete.
 *
 * @param opts - The options for the temp folder.
 * @param cb - The callback to run when the folder is opened.
 */
export const tempFolder: (
  options: Partial<TempFolderOptions>,
  cb: TempFolderCallback,
) => void = (opts, cb) => {
  const { id, persist }: TempFolderOptions = { ...DEFAULT_OPTIONS, ...opts };

  makeTempFolder(typeof id === "string" ? id : id())
    .then(async (wd) => {
      await cb(null, wd);

      setTimeout(() => {
        rmdir(wd).then().catch(console.error);
      }, persist);
    })
    .catch(async (error: Error) => {
      await cb(error, null);
    });
};
