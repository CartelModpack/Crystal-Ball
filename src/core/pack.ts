// Helpers

/**
 * Convert a string to a slug-viable string.
 *
 * @param str - The source string.
 * @returns A usable slug.
 */
export const slugify: (string: string) => string = (str) => {
  return str
    .trim()
    .toLowerCase()
    .replaceAll(/[ /\\?%*:|"<>\0]/g, "");
};

// Types

/** Preloaded manifest & variant data for a modpack. */
type ModpackConfig = Partial<PackManifest> &
  Omit<PackManifest, "slug" | "version" | "targets" | "main" | "variants">;

/** Preloaded manifest * variant data for a modpack variant. */
type ModpackVariantConfig = Partial<PackVariantManifest> &
  Omit<PackVariantManifest, "slug" | "inherits" | "resources">;

/** A method that can be used to export the modpack in some way. */
type ExportMethod<T, P extends unknown[]> = (...data: P) => T;

/** Export method for a variant. */
export type ModpackVariantExporter<T> = ExportMethod<T, [PackVariantManifest]>;
/** Export method for a modpack. */
export type ModpackExporter<T> = ExportMethod<
  T,
  [PackManifest, ModpackVariant[]]
>;

// Modpack Variant

export interface ModpackVariant {
  /** The manifest for the modpack. */
  readonly manifest: PackVariantManifest;
  /**
   * Adds a resource to the variant.
   *
   * @param resource - The resource to add.
   * @returns The resource added to the pack.
   * @throws Errors if the resource already in this variant.
   */
  addResource: (resource: PackResource) => PackResource;
  /**
   * Removes a resource from the variant.
   *
   * @param name - The name of the resource.
   * @throws Errors if the resource is not in this variant.
   */
  removeResource: (name: string) => void;
  /**
   * Gets a resource.
   *
   * @param name - The name of the resource.
   * @returns The requested resource, or `null` if no resource was found.
   */
  getResource: (name: string) => PackResource | null;
  /**
   * Exports the variant data depending on the export method.
   *
   * @param exporter - The method that exports the data in some way.
   * @returns Whatever data the export method returns.
   */
  export: <T>(exporter: ModpackVariantExporter<T>) => T;
  /**
   * Exports the variant data (with the inherited variant resources imprinted) depending on the export method.
   *
   * @param exporter - The method that exports the data in some way.
   * @returns Whatever data the export method returns.
   */
  exportWithInherited: <T>(
    modpack: Modpack,
    exporter: ModpackVariantExporter<T>,
  ) => T;
}

/**
 * Constructs a Modpack variant.
 *
 * @param options - The options to pass to the variant.
 * @returns An instance the variant.
 */
export const ModpackVariant = (
  options: ModpackVariantConfig,
): ModpackVariant => {
  const manifest: PackVariantManifest = {
    name: options.name,
    slug: slugify(options.slug ?? options.name),
    inherits: options.inherits ?? null,
    resources: options.resources ?? [],
  };

  let resourceNames: string[] = manifest.resources.map((val) => val.name);

  const addResource = (resource: PackResource): PackResource => {
    if (resourceNames.includes(resource.name)) {
      throw new Error(`Can't add duplicate resource "${resource.name}".`);
    }

    manifest.resources.push(resource);
    resourceNames.push(resource.name);

    return resource;
  };

  const removeResource = (name: string) => {
    if (!resourceNames.includes(name)) {
      throw new Error(`Can't remove non-existant resource "${name}".`);
    }

    const index = resourceNames.indexOf(name);

    manifest.resources = manifest.resources.splice(index, 1);
    resourceNames = resourceNames.splice(index, 1);
  };

  const getResource = (name: string): PackResource | null => {
    if (resourceNames.includes(name)) {
      return manifest.resources[resourceNames.indexOf(name)];
    }

    return null;
  };

  const exportMethod = <T>(exporter: ModpackVariantExporter<T>): T =>
    exporter(manifest);

  const exportWithInheritedHelper = (
    variantManifest: PackVariantManifest,
    manifests: PackVariantManifest[],
  ): PackVariantManifest => {
    if (variantManifest.inherits === null) {
      return variantManifest;
    }

    if (!manifests.map((mnf) => mnf.slug).includes(variantManifest.inherits)) {
      throw new Error(
        `Can't get non-existant inherited variant ${variantManifest.inherits}.`,
      );
    }

    const inherited =
      manifests[
        manifests.map((mnf) => mnf.slug).indexOf(variantManifest.inherits)
      ];

    const output: PackVariantManifest = {
      name: variantManifest.name,
      slug: variantManifest.slug,
      inherits: variantManifest.inherits,
      resources: [
        ...exportWithInheritedHelper(inherited, manifests).resources.filter(
          (rs) =>
            !variantManifest.resources.map((crs) => crs.name).includes(rs.name),
        ),
        ...variantManifest.resources,
      ],
    };

    return output;
  };

  const exportWithInherited = <T>(
    modpack: Modpack,
    exporter: ModpackVariantExporter<T>,
  ): T => {
    return exporter(
      exportWithInheritedHelper(
        manifest,
        modpack.variants.map((vnt) => vnt.manifest),
      ),
    );
  };

  return {
    manifest,
    addResource,
    removeResource,
    getResource,
    export: exportMethod,
    exportWithInherited,
  };
};

// Modpack

export interface Modpack {
  /** The modpacks manifest data. */
  readonly manifest: PackManifest;
  /** The variant instances attached to the modpack. */
  readonly variants: ModpackVariant[];
  /**
   * Adds a variant to the modpack.
   *
   * @param options - The config options for the variant. See {@link ModpackVariant}.
   * @throws Errors if a variant with the same slug is already in this modpack.
   */
  addVariant: (options: ModpackVariantConfig, setAsMain?: boolean) => void;
  /**
   * Gets a variant from the modpack.
   *
   * @param slug - The slug id of the variant.
   * @returns The modpack variant instance, or `null` if it is not in this pack.
   */
  getVariant: (slug: string) => ModpackVariant | null;
  /**
   * Removes a variant from the modpack.
   *
   * @param slug - The slug id of the variant.
   * @throws Errors if the variant to be removed does not exist in this pack.
   */
  removeVariant: (slug: string) => void;
  /**
   * Sets the main variant of the modpack.
   *
   * @param slug - The slug id of the variant.
   * @throws Errors if the variant to be set as main does not exist in this pack.
   */
  setMainVariant: (slug: string | null) => void;
  /**
   * Exports the modpack data depending on the export method.
   *
   * @param exporter - The method that exports the data in some way.
   * @returns Whatever data the export method returns.
   */
  export: <T>(exporter: ModpackExporter<T>) => T;
}

/**
 * Constructs a Modpack.
 *
 * @param options - The options for the modpack.
 * @returns A new instance of a modpack ready for use.
 */
export const Modpack = (options: ModpackConfig): Modpack => {
  const manifest: PackManifest = {
    name: options.name,
    slug: slugify(options.slug ?? options.name),
    description: options.description,
    author: options.author,
    version: options.version ?? "1.0.0",
    targets: options.targets ?? [],
    main: options.main ?? null,
    variants: options.variants ?? [],
  };

  const variants: ModpackVariant[] = [];

  const getVariant = (slug: string): ModpackVariant | null => {
    if (manifest.variants.includes(slug)) {
      return variants.find(
        (variant) => variant.manifest.slug === slug,
      ) as ModpackVariant;
    }

    return null;
  };

  const setMainVariant = (slug: string | null): void => {
    if (slug === null || manifest.variants.includes(slug)) {
      manifest.main = slug;

      return;
    }

    throw new Error(
      `Can't set main variant to non-existant variant "${slug}".`,
    );
  };

  const addVariant = (
    opts: ModpackVariantConfig,
    setAsMain: boolean | undefined,
  ): void => {
    const newVariant = ModpackVariant(opts);

    if (manifest.variants.includes(newVariant.manifest.slug)) {
      throw new Error(
        `Can't add duplicate variant "${newVariant.manifest.slug}".`,
      );
    }

    variants.push(newVariant);
    manifest.variants.push(newVariant.manifest.slug);

    if (setAsMain ?? false) {
      setMainVariant(newVariant.manifest.slug);
    }
  };

  const removeVariant = (slug: string): void => {
    if (manifest.variants.includes(slug)) {
      manifest.variants = manifest.variants.splice(
        manifest.variants.indexOf(slug),
        1,
      );

      return;
    }

    throw new Error(`Can't remove non-existant variant "${slug}".`);
  };

  const exportMethod = <T>(exporter: ModpackExporter<T>) =>
    exporter(manifest, variants);

  return {
    manifest,
    variants,
    addVariant,
    getVariant,
    removeVariant,
    setMainVariant,
    export: exportMethod,
  };
};
