import type { useToaster } from "../composables/useToaster";

export function handleDocumentUploadError(
  error: any,
  toaster: ReturnType<typeof useToaster>,
) {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  const backendName = error?.response?._data?.name;
  const backendMessage = error?.response?._data?.message;

  if (status === 415) {
    toaster.error({
      titleTag: "h2",
      description:
        backendMessage ||
        (backendName === "FileTypeError"
          ? "Le type du fichier n’est pas supporté. Seuls les fichiers PDF, JPG et PNG sont autorisés."
          : backendName === "FileExtensionError"
            ? "L’extension du fichier n’est pas supportée. Seuls les fichiers PDF, JPG et PNG sont autorisés."
            : backendName === "FileTypePdfOnlyError"
              ? "Seuls les fichiers PDF sont autorisés pour cette catégorie."
              : backendName === "FileContainsJavaScriptError"
                ? "Le fichier PDF contient du JavaScript, ce qui n’est pas autorisé."
                : "Erreur lors de l’upload du fichier."),
    });
    return;
  } else if (status === 413) {
    toaster.error({
      titleTag: "h2",
      description:
        "Le fichier téléversé dépasse la taille maximale autorisée (5 Mo).",
    });
    return;
  } else {
    toaster.error({
      titleTag: "h2",
      description: error instanceof Error ? error.message : String(error),
    });
  }
}
