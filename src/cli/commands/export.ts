import { Command } from "commander";

export const exportCommand = new Command("export").description(
  "Export packs to Curseforge, Modrinth, etc.",
);
