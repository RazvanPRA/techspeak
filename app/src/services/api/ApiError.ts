/** A failed call to the TechSpeak server. `status` is 0 when the server could not be reached. */
export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
