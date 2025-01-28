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
  /** The main variant of the pack. */
  main: string;
  /** An object storing the slug and filepath of variants. */
  variants: { [key: string]: string };
}

/** A basic pack resource. */
interface PackResourceBase {
  /** The source of the resource. */
  source: "modrinth" | "curseforge" | "file";
  /** The type of resource. */
  type: "mods" | "resourcepacks" | "shaderpacks" | "config";
}

/** A pack resource from a distribution server (like modrinth, curseforge, etc). */
interface PackResourceModDistro extends PackResourceBase {
  source: "modrinth" | "curseforge";
  /** The ID of the resource. */
  id: string;
}
/** A pack resource from a file on the web. */
interface PackResourceFile extends PackResourceBase {
  source: "file";
  /** The URL to the file. */
  url: string;
  /** The Name of the resource. */
  name: string;
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
