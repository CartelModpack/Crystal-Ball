const { execSync } = require("child_process");
const { mkdirSync } = require("fs");
const { packwiz } = require("../package.json");
const { join } = require("path");

const cwd = join(process.cwd(), "./lib/packwiz");

mkdirSync(cwd, { recursive: true });

console.info("Downloading required version of packwiz...");

if (packwiz == null) {
  throw new Error("Packwiz version is not specified in package.json!");
}

console.info(
  `Required version is commit ${packwiz.slice(0, 7)}! Downloading...`,
);

execSync("git init", { cwd });
execSync("git remote add origin https://github.com/packwiz/packwiz.git", {
  cwd,
});
execSync(`git fetch origin ${packwiz} --depth=1`, { cwd });
execSync("git checkout FETCH_HEAD", { cwd });

console.info("Packwiz source downloaded! Building with Go...");

execSync("go build", { cwd });

console.info(`Packwiz installed at ${join(cwd, "./packwiz.exe")}`);
