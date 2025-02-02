import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { consola } from "consola";

interface PackwizInstallConfig {
  tool: string;
  format: string;
}

/** The default packwiz version to use. */
export const PACKWIZ_VERSION: PackwizInstallConfig = {
  tool: "241f24b550f6fe838913a56bdd58bac2fc53254a",
  format: "1.1.0",
};

export const installPackwiz: (
  packwiz?: Partial<PackwizInstallConfig>,
) => Promise<string> = async (packwiz): Promise<string> => {
  return await new Promise<string>((resolve, reject) => {
    const cwd = join(process.cwd(), "./lib/packwiz");

    if (existsSync(cwd)) {
      rmSync(cwd, { recursive: true });
    }
    mkdirSync(cwd, { recursive: true });

    consola.info("Fetching required version of packwiz...");

    if (packwiz?.tool === undefined || packwiz.format === undefined) {
      reject(new Error("Packwiz tool/format version is not specified!"));

      return;
    }

    consola.info(
      `Required version is commit ${packwiz.tool.slice(0, 7)}! Downloading...`,
    );

    try {
      execSync("git init", { cwd });
      execSync("git remote add origin https://github.com/packwiz/packwiz.git", {
        cwd,
      });
      execSync(`git fetch origin ${packwiz.tool} --depth=1`, { cwd });
      execSync("git checkout FETCH_HEAD", { cwd });

      consola.info("Packwiz source downloaded! Building with Go...");

      execSync("go build", { cwd });

      consola.info(`Packwiz installed at "./lib/packwiz/packwiz"`);

      resolve(`./lib/packwiz/packwiz`);
    } catch (error) {
      reject(new Error("Failed to install packwiz!", { cause: error }));
    }
  });
};
