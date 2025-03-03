declare module "@vao/shared/src/utils/file.mjs" {
  export function encodeFilename(filename: string): string;
  export function getFileNameAndExtension(filename: string): {
    name: string;
    extension: string;
  };
}
