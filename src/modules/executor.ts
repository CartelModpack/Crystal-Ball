import { spawn } from "node:child_process";

/** Stdio interfaces. */
interface Stdio {
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.WriteStream;
  stdin: NodeJS.ReadStream;
}

/** Execute config. */
interface ExecuteConfig {
  cwd: string;
  stdio: Partial<Stdio>;
}

/**
 * Execute a command.
 *
 * @param command - The command to run.
 * @param config - Config for the execution.
 * @returns A promise that resolves into the exit code.
 */
export const execute = (
  command: string,
  config: Partial<ExecuteConfig>,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true, cwd: config.cwd });

    child.stdout.pipe(config.stdio?.stdout ?? process.stdout);
    child.stderr.pipe(config.stdio?.stderr ?? process.stderr);
    (config.stdio?.stdin ?? process.stdin).pipe(child.stdin);

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Process exited with code ${String(code)}`));
      }
    });
  });
};

/**
 * Execute all commands at the same time.
 *
 * @param commands - The commands to execute.
 * @param config - Config for the execution.
 * @returns A promise that resolves into an array of exit codes.
 */
export const executeAll = (
  commands: string[],
  config: Partial<ExecuteConfig>,
): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const execs: Promise<number>[] = [];

    for (const cmd of commands) {
      execs.push(execute(cmd, config));
    }

    Promise.all(execs).then(resolve).catch(reject);
  });
};

const executeInOrderHelper = (
  commands: string[],
  config: Partial<ExecuteConfig>,
  index: number,
  returnList: number[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    execute(commands[index], config)
      .then((code) => {
        returnList.push(code);

        if (index === commands.length - 1) {
          resolve();
        } else {
          executeInOrderHelper(commands, config, index + 1, returnList)
            .then(resolve)
            .catch(reject);
        }
      })
      .catch(reject);
  });
};

/**
 * Execute all commands in order. Goes left to right.
 *
 * @param commands - The commands to execute.
 * @param config - Config for the execution.
 * @returns A promise that resolves into an array of exit codes.
 */
export const executeInOrder = (
  commands: string[],
  config: Partial<ExecuteConfig>,
): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const returnList: number[] = [];

    executeInOrderHelper(commands, config, 0, returnList)
      .then(() => {
        resolve(returnList);
      })
      .catch(reject);
  });
};
