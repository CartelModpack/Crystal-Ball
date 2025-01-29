/** Config for methods that use file-based operations. */
interface FSConfig {
  /** The working directory. Default varies by environment, probably `process.cwd()`. */
  cwd: string;
}
