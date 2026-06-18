import type { RouteResponseError } from "@vao/shared-bridge";
import type { FetchError } from "ofetch";

export type ApiError = FetchError<RouteResponseError>;

export function getApiErrorMessage(error: unknown): string {
  return (
    (error as ApiError)?.data?.message ??
    (error as ApiError)?.data?.name ??
    (error as Error).message ??
    String(error)
  );
}
