// /framework/http/errors.ts — never leak internals
import { HttpError } from "./validate.ts";
export function jsonError(err: unknown): Response {
  if (err instanceof HttpError) return Response.json({ error: err.message }, { status: err.status });
  console.error(err);                                   // detail stays server-side
  return Response.json({ error: "Internal Server Error" }, { status: 500 });
}
