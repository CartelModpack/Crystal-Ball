import { execSync } from "child_process";
import { mkdirSync } from "fs";
import packageFile from "../package.json" with { type: "json" };
import { join } from "path";

const cwd = join(process.cwd(), "./lib/packwiz");

mkdirSync(cwd, { recursive: true });

console.info("Downloading required version of packwiz...");

if (packageFile.packwiz == null) {
  throw new Error("Packwiz version is not specified in package.json!");
}

console.info(
  `Required version is commit ${packageFile.packwiz.slice(0, 7)}! Downloading...`,
);

execSync("git init", { cwd });
execSync("git remote add origin https://github.com/packwiz/packwiz.git", {
  cwd,
});
execSync(`git fetch origin ${packageFile.packwiz} --depth=1`, { cwd });
execSync("git checkout FETCH_HEAD", { cwd });

console.info("Packwiz source downloaded! Building with Go...");

execSync("go build", { cwd });

console.info(`Packwiz installed at ${join(cwd, "./packwiz.exe")}`);
