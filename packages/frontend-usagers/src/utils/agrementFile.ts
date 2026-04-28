import {
  FILE_CATEGORY_CONFIG,
  type AgrementDto,
  type FileKey,
} from "@vao/shared-bridge";

type AgrementFormValues = Partial<AgrementDto> & {
  [K in FileKey]?: unknown;
};

type AgrementFile = NonNullable<AgrementDto["agrementFiles"]>[number];
type FileCategory = AgrementFile["category"];

function isMultipleCategory(category: FileCategory): boolean {
  return FILE_CATEGORY_CONFIG[category as keyof typeof FILE_CATEGORY_CONFIG].multiple;
}

export function getFileByCategory(
  agrementEnTraitement: AgrementDto,
  updatedData: AgrementFormValues,
) {
  const filesByCategory = new Map<string, AgrementFile[]>();
  const existingUuids = new Set(
    (agrementEnTraitement.agrementFiles ?? []).map((file) => file.uuid),
  );
  const updatedFiles = (updatedData.agrementFiles ?? []) as AgrementFile[];

  for (const file of updatedFiles) {
    const category = file.category;
    const categoryFiles = filesByCategory.get(category) ?? [];

    if (isMultipleCategory(category)) {
      if (categoryFiles.some((categoryFile) => categoryFile.uuid === file.uuid)) {
        continue;
      }

      filesByCategory.set(category, [...categoryFiles, file]);
      continue;
    }

    if (!filesByCategory.has(category)) {
      filesByCategory.set(category, [file]);
      continue;
    }

    const currentFile = categoryFiles[0];
    const currentFileExistsBeforeUpdate = existingUuids.has(currentFile.uuid);
    const nextFileExistsBeforeUpdate = existingUuids.has(file.uuid);

    if (currentFileExistsBeforeUpdate && !nextFileExistsBeforeUpdate) {
      filesByCategory.set(category, [file]);
    }
  }

  return filesByCategory;
}
