import type { FieldError, LegacyErrorBody, PlunkErrorBody } from "./types/common.ts";

export class PlunkError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly requestId?: string;
  readonly errors?: FieldError[];
  readonly suggestion?: string;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode: number;
      requestId?: string;
      errors?: FieldError[];
      suggestion?: string;
      details?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.name = "PlunkError";
    this.code = options.code ?? "UNKNOWN_ERROR";
    this.statusCode = options.statusCode;
    this.requestId = options.requestId;
    this.errors = options.errors;
    this.suggestion = options.suggestion;
    this.details = options.details;
  }

  static async fromResponse(response: Response): Promise<PlunkError> {
    const statusCode = response.status;
    let body: unknown;

    try {
      body = await response.json();
    } catch {
      return new PlunkError(response.statusText || "Request failed", {
        statusCode,
        code: "REQUEST_FAILED",
      });
    }

    return PlunkError.fromBody(body, statusCode);
  }

  static fromBody(body: unknown, statusCode: number): PlunkError {
    if (isLegacyErrorBody(body)) {
      return new PlunkError(body.error, {
        statusCode,
        code: "VALIDATION_ERROR",
      });
    }

    if (isPlunkErrorBody(body) && body.error) {
      const { error } = body;
      return new PlunkError(error.message ?? "Request failed", {
        code: error.code,
        statusCode: error.statusCode ?? statusCode,
        requestId: error.requestId,
        errors: error.errors,
        suggestion: error.suggestion,
        details: error.details,
      });
    }

    return new PlunkError("Request failed", {
      statusCode,
      code: "REQUEST_FAILED",
    });
  }
}

function isLegacyErrorBody(body: unknown): body is LegacyErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as LegacyErrorBody).error === "string" &&
    !("success" in body)
  );
}

function isPlunkErrorBody(body: unknown): body is PlunkErrorBody {
  return typeof body === "object" && body !== null && "error" in body;
}
