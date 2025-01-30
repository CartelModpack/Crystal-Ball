import { consola } from "consola";
import { stackObjects } from "../lib/obj";

interface PromptConfig {
  default: (() => Promise<string>) | string | undefined;
  postprocess: ((value: string | undefined) => Promise<string>) | undefined;
  retries: number;
}

interface CleanPromptConfig extends PromptConfig {
  default: string | undefined;
}

/** Helper method to get the process the config for use. */
const processConfig: (
  config: PromptConfig,
) => Promise<CleanPromptConfig> = async (config) => {
  return await new Promise((resolve, reject) => {
    if (!config.default || typeof config.default === "string") {
      resolve({ ...config } as CleanPromptConfig);
    } else {
      config
        .default()
        .then((defaultVal) => {
          resolve({
            ...config,
            default: defaultVal,
          });
        })
        .catch(reject);
    }
  });
};

/** Recursive method to prompt the user after getting the default value. */
const promptRecursively: (
  query: string,
  config: CleanPromptConfig,
  attempt: number,
) => Promise<string> = async (query, config, attempt) => {
  return new Promise((resolve, reject) => {
    consola
      .prompt(query, {
        type: "text",
        default: config.default,
      })
      .then((val) => {
        if (config.postprocess) {
          config
            .postprocess(val)
            .then((cleaned) => {
              resolve(cleaned.trim());
            })
            .catch((error: Error) => {
              if (config.retries <= attempt) {
                consola.warn(error.message);
                promptRecursively(query, config, attempt + 1)
                  .then(resolve)
                  .catch(reject);
              } else {
                reject(error);
              }
            });
        } else {
          resolve(val.trim());
        }
      })
      .catch(reject);
  });
};

/**
 * Prompt the user using `consola`.
 *
 * @param query - The query to ask.
 * @param conf - The configuration for the prompt.
 * @returns The response from the prompt.
 */
export const prompt: (
  query: string,
  config?: Partial<PromptConfig>,
) => Promise<unknown> = async (query, conf) => {
  return await new Promise((resolve, reject) => {
    processConfig(
      stackObjects(
        {
          default: undefined,
          postprocess: undefined,
          retries: 0,
        },
        conf ?? {},
      ),
    )
      .then((config) => {
        promptRecursively(query, config, 0).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};
