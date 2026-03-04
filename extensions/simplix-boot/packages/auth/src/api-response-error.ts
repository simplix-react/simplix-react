export type ErrorDetail =
  | Array<{ field: string; message: string }>
  | Record<string, unknown>;

export class ApiResponseError extends Error {
  constructor(
    public readonly status: number,
    public readonly type: string,
    public readonly errorMessage: string,
    public readonly timestamp: string,
    public readonly errorCode?: string,
    public readonly errorDetail?: ErrorDetail,
  ) {
    super(errorMessage);
    this.name = "ApiResponseError";
  }
}
