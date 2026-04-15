import type { useToaster } from "../composables/useToaster";

interface UploadError {
  response?: {
    status?: number;
    _data?: {
      name?: string;
      message?: string;
    };
  };
}

export function handleDocumentUploadError(
  error: unknown,
  toaster: ReturnType<typeof useToaster>,
) {
  const uploadError = error as UploadError;
  const status = uploadError?.response?.status;
  const backendName = uploadError?.response?._data?.name;
  const backendMessage = uploadError?.response?._data?.message;

  if (status === 415) {
    const fallbackByName: Record<string, string> = {
      FileTypeError:
        "Le type du fichier n'est pas supporté. Seuls les fichiers PDF, JPG et PNG sont autorisés.",
      FileExtensionError:
        "L'extension du fichier n'est pas supportée. Seuls les fichiers PDF, JPG et PNG sont autorisés.",
      FileTypePdfOnlyError:
        "Seuls les fichiers PDF sont autorisés pour cette catégorie.",
      FileContainsJavaScriptError:
        "Le fichier PDF contient du JavaScript, ce qui n'est pas autorisé.",
    };
    toaster.error({
      titleTag: "h2",
      description:
        backendMessage ??
        (backendName ? fallbackByName[backendName] : undefined) ??
        "Erreur lors de l'upload du fichier.",
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
