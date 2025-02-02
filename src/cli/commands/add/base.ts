import { Command } from "commander";

/** `add` command CLI flags. */
export interface AddCLIFlags {
  /** The variant to add the resource to. Defaults to the main variant if it exists. */
  variant: string;
  /** The type of resource to add. Defaults to `mod` if a URL resource. */
  type: PackResourceType;
}

/**
 * Verifies that a type is valid.
 *
 * @param type - The string containing the type or null value.
 * @returns If the type is allowed, or non-usable.
 */
export const verifyResourceType = (type: string | null): boolean => {
  return (
    type === "mod" ||
    type === "resourcepack" ||
    type === "shader" ||
    type === "config" ||
    type === null
  );
};

/**
 * Creates a base `add` command variant.
 *
 * @param resourceName - The name.
 * @param displayName - The display name of the resource. (i.e url -\> URL, modrinth -\> Modrinth).
 * @returns A basic add command that can be further customized.
 */
export const createBaseAddCommand: (
  resourceName: string,
  displayName?: string,
) => Command = (resourceName, displayName) => {
  return new Command(resourceName)
    .description(`Adds a new ${displayName ?? resourceName} resource.`)
    .option(
      "-t, --type <type>",
      "The type of resource this is (mods, resourcepacks, etc.). Defaults to mods for URL resources.",
    )
    .option(
      "-v, --variant <variant>",
      "The variant to add the resouce to. Defaults to the main pack variant if it exists.",
    );
};
