import { createBaseAddCommand } from "./base";

export const addURLCommand = createBaseAddCommand("url", "URL")
  .argument("<url>", "The URL of the resource.")
  .argument("[name]", "The name of the resource.");
