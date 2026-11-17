/** A readable message for anything thrown (Error or not). */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
