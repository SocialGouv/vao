import {
  FILE_CATEGORY_CONFIG,
  type AgrementDto,
  type AgrementFilesDto,
  type FileKey,
} from "@vao/shared-bridge";

type AgrementFormValues = Partial<AgrementDto> & {
  [K in FileKey]?: unknown;
};

type AgrementFile = NonNullable<AgrementDto["agrementFiles"]>[number];
type FileCategory = AgrementFile["category"];
type FilesByCategory = Map<string, AgrementFile[]>;

/**
 * Fusionne les fichiers existants (déjà enregistrés dans l'agrément)
 * et les fichiers modifiés ou ajoutés lors de la soumission du formulaire courant.
 *
 * - Pour chaque catégorie de fichier:
 *   - Si la catégorie est multiple, elle déduplique et remplace la liste par les fichiers du formulaire.
 *   - Si la catégorie est single-upload, elle remplace le fichier existant par le nouveau s'il y en a un,
 *     sinon elle conserve l'existant.
 * - Si une catégorie n'est pas présente dans les fichiers du formulaire, les fichiers existants sont conservés.
 * - Si une catégorie single-upload est explicitement vidée dans le formulaire, les fichiers existants sont supprimés.
 *
 * Cette fonction garantit:
 *   - L'ajout de nouveaux fichiers à chaque étape,
 *   - La suppression effective des fichiers supprimés par l'utilisateur,
 *   - La persistance des fichiers déjà uploadés si aucune modification n'est faite pour une catégorie.
 *
 * @param agrementEnTraitement L'agrément en cours d'édition, contenant les fichiers existants
 * @param updatedData Les valeurs du formulaire courant, contenant les fichiers ajoutés/supprimés à cette étape
 * @returns La liste fusionnée des fichiers à conserver pour l'agrément
 */
export function getFileByCategory(
  agrementEnTraitement: AgrementDto,
  updatedData: AgrementFormValues,
): AgrementFilesDto[] {
  const existingFiles = (agrementEnTraitement.agrementFiles ??
    []) as AgrementFile[];
  const existingIdentifiers = new Set(
    existingFiles
      .map((file) => getFileIdentifier(file))
      .filter((identifier): identifier is string => Boolean(identifier)),
  );
  const updatedFiles = (updatedData.agrementFiles ?? []) as AgrementFile[];

  if (updatedFiles.length === 0) {
    return [];
  }

  const filesByCategory = groupFilesByCategory(existingFiles);
  const updatedFilesByCategory = groupFilesByCategory(updatedFiles);

  for (const [
    category,
    updatedCategoryFiles,
  ] of updatedFilesByCategory.entries()) {
    if (isMultipleCategory(category as FileCategory)) {
      filesByCategory.set(category, dedupeFiles(updatedCategoryFiles));
      continue;
    }

    const selectedFile = pickSingleFile(
      updatedCategoryFiles,
      existingIdentifiers,
    );
    filesByCategory.set(category, selectedFile ? [selectedFile] : []);
  }

  const updatedSingleCategoryByIdentifier = new Map<string, string>();
  for (const file of updatedFiles) {
    if (isMultipleCategory(file.category)) {
      continue;
    }

    const fileIdentifier = getFileIdentifier(file);
    if (!fileIdentifier) {
      continue;
    }

    updatedSingleCategoryByIdentifier.set(fileIdentifier, file.category);
  }

  for (const [category, files] of filesByCategory.entries()) {
    if (isMultipleCategory(category as FileCategory)) {
      continue;
    }

    const filteredFiles = files.filter((file) => {
      const fileIdentifier = getFileIdentifier(file);
      if (!fileIdentifier) {
        return true;
      }

      const updatedCategory =
        updatedSingleCategoryByIdentifier.get(fileIdentifier);
      if (!updatedCategory) {
        return true;
      }

      return updatedCategory === category;
    });

    if (filteredFiles.length === 0) {
      filesByCategory.delete(category);
      continue;
    }

    filesByCategory.set(category, filteredFiles);
  }

  return Array.from(filesByCategory.values()).flat();
}

function isMultipleCategory(category: FileCategory): boolean {
  return FILE_CATEGORY_CONFIG[category as keyof typeof FILE_CATEGORY_CONFIG]
    .multiple;
}

function getFileIdentifier(file: AgrementFile): string | undefined {
  if (typeof file.uuid === "string" && file.uuid.length > 0) {
    return file.uuid;
  }

  if (typeof file.fileUuid === "string" && file.fileUuid.length > 0) {
    return file.fileUuid;
  }

  return undefined;
}

function dedupeFiles(files: AgrementFile[]): AgrementFile[] {
  const seen = new Set<string>();

  return files.filter((file) => {
    const identifier = getFileIdentifier(file);
    if (!identifier) {
      return true;
    }
    if (seen.has(identifier)) {
      return false;
    }
    seen.add(identifier);
    return true;
  });
}

function groupFilesByCategory(files: AgrementFile[]): FilesByCategory {
  const filesByCategory: FilesByCategory = new Map();

  for (const file of files) {
    const categoryFiles = filesByCategory.get(file.category) ?? [];
    filesByCategory.set(file.category, [...categoryFiles, file]);
  }

  return filesByCategory;
}

function pickSingleFile(
  files: AgrementFile[],
  existingIdentifiers: Set<string>,
): AgrementFile | undefined {
  const dedupedFiles = dedupeFiles(files);
  const newFile = dedupedFiles.find((file) => {
    const identifier = getFileIdentifier(file);
    if (!identifier) {
      return false;
    }

    return !existingIdentifiers.has(identifier);
  });

  return newFile ?? dedupedFiles[0];
}
