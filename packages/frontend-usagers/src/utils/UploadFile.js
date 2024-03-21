import { $fetchBackend } from "./fetchBackend";
import { logger } from "#imports";

const log = logger("utils/UploadFile");

export default async function UploadFile(category, file) {
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
