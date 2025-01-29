import { FastJson } from "fast-json";

/**
 * Fetch data with a GET request from some network source.
 *
 * @param endpoint - The endpoint to request from.
 * @param dataPath - The datapath to the data you want from the response.
 * @param filter - If your requested data is an array, a filter function to restrict the results.
 * @returns Your requested data.
 */
export const fetchData: <T>(
  endpoint: string,
  dataPath: string,
  filter?: T extends unknown[]
    ? ((value: T[number], index: number) => boolean) | undefined
    : never,
) => Promise<T> = async <T>(
  endpoint: string,
  dataPath: string,
  filter:
    | (T extends unknown[]
        ? ((value: T[number], index: number) => boolean) | undefined
        : never)
    | undefined,
): Promise<T> => {
  const jsonParser = new FastJson();

  return await new Promise<T>((resolve, reject) => {
    fetch(endpoint, {
      method: "GET",
    })
      .then((res) => {
        res
          .text()
          .then((data) => {
            jsonParser.on(dataPath, (raw) => {
              const json = JSON.parse(raw as string);

              jsonParser.skip();

              if (Array.isArray(json) && filter) {
                resolve(json.filter(filter) as T);
              } else {
                resolve(json as T);
              }
            });
            jsonParser.write(data);
          })
          .catch(reject);
      })
      .catch(reject);
  });
};
