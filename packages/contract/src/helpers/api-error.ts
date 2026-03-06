export class ApiError extends Error {
  constructor(
    /** HTTP status code of the failed response. */
    public readonly status: number,
    /** Raw response body text. */
    public readonly body: string,
  ) {
    super(`API Error ${status}: ${body}`);
    this.name = "ApiError";
  }
}
