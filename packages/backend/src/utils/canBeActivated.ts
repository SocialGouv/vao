import { status } from "../helpers/users";

export function canBeActivated(statusCode: string) {
  return (
    statusCode === status.TEMPORARY_BLOCKED ||
    statusCode === status.NEED_EMAIL_VALIDATION
  );
}
