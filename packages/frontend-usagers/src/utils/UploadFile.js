import { $fetchBackend } from "./fetchBackend";
import { logger } from "#imports";


export default async function UploadFile(category, file) {
  const log = logger("utils/UploadFile");
  log.d("uploadFile - IN", { category, name: file.name });
  const body = new FormData();
  body.append("category", category);
  body.append("file", file);
  const url = `/documents`;
  const { uuid } = await $fetchBackend(url, {
    method: "post",
    credentials: "include",
    body,
  });
  log.i("uploadFile - DONE");
  return uuid;
}

export function checkFormatFile(file) {
  return (
    !file ||
    file.uuid ||
    file.type == "application/pdf" ||
    file.type == "image/png" ||
    file.type == "image/jpeg"
  );
}

export function checkFormatFiles(files) {
  for (const file of files.value) if (!checkFormatFile(file)) return false;
  return true;
}
