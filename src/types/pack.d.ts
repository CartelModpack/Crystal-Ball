/** The pack manifest file. */
interface PackManifest {
  /** The name of the pack. */
  name: string;
  /** An ID that can be used for files/searching. */
  slug: string;
  /** A description of the pack. */
  description: string;
  /** The pack's author. */
  author: string;
  /** The pack's current version. Should be semver compatible. */
  version: string;
  /** A list of game versions to build for. */
  targets: string[];
  /** The main variant of the pack. If `null`, no main variant is specifed. */
  main: string | null;
  /** A list storing the slug of all variants. */
  variants: string[];
}

/** The type of pack resource. */
type PackResourceType = "mod" | "resourcepack" | "shader" | "config";

/** A basic pack resource. */
interface PackResourceBase {
  /** The source of the resource. */
  source: "modrinth" | "curseforge" | "url";
  /** The type of resource. */
  type: PackResourceType;
  /** The name of the resource. */
  name: string;
}

/** A pack resource from a distribution server (like modrinth, curseforge, etc). */
interface PackResourceModDistro extends PackResourceBase {
  source: "modrinth" | "curseforge";
  /** The ID of the resource. */
  id: string;
}
/** A pack resource from a file on the web. */
interface PackResourceFile extends PackResourceBase {
  source: "url";
  /** The URL to the file. */
  url: string;
}

/** A resource for the modpack. */
type PackResource = PackResourceModDistro | PackResourceFile;

/** The manifest for a pack variant. */
interface PackVariantManifest {
  /** The name of the variant. */
  name: string;
  /** An ID that can be used for files/searching. */
  slug: string;
  /** The file path of another variant that this one may inherit from. */
  inherits: string | null;
  /** The resources in this pack variant. */
  resources: PackResource[];
}
