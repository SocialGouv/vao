const extensions = [".pdf", ".jpg", ".png"];

export const fileValidationExtension = (filename: string): boolean =>
  extensions.some((extension) => filename.toLowerCase().endsWith(extension));
