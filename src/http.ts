import { PlunkError } from "./errors.ts";

export const DEFAULT_BASE_URL = "https://next-api.useplunk.com";

export interface HttpClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

export function toQueryParams<T extends object>(
  params: T | undefined,
): QueryParams | undefined {
  return params as QueryParams | undefined;
}

export interface RequestConfig {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  formData?: FormData;
  query?: QueryParams;
  headers?: Record<string, string>;
  unwrapEnvelope?: boolean;
}

interface Envelope<T> {
  success: boolean;
  data: T;
}

export class HttpClient {
  readonly apiKey: string;
  readonly baseUrl: string;

  constructor(options: HttpClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  }

  async request<T>(config: RequestConfig): Promise<T> {
    const url = this.buildUrl(config.path, config.query);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      ...config.headers,
    };

    const init: RequestInit = {
      method: config.method,
      headers,
    };

    if (config.formData !== undefined) {
      init.body = config.formData;
    } else if (config.body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, init);

    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      throw await PlunkError.fromResponse(response);
    }

    const json: unknown = await response.json();

    if (config.unwrapEnvelope) {
      return unwrapEnvelope<T>(json);
    }

    return json as T;
  }

  private buildUrl(path: string, query?: QueryParams): string {
    const url = new URL(path, `${this.baseUrl}/`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }
}

function unwrapEnvelope<T>(json: unknown): T {
  if (
    typeof json === "object" &&
    json !== null &&
    "success" in json &&
    "data" in json
  ) {
    return (json as Envelope<T>).data;
  }

  return json as T;
}

export interface EnvelopeResult<T> {
  data: T;
  message?: string;
}

export function unwrapEnvelopeResult<T>(json: unknown): EnvelopeResult<T> {
  if (typeof json === "object" && json !== null && "data" in json) {
    const envelope = json as { data: T; message?: string };
    return { data: envelope.data, message: envelope.message };
  }

  return { data: json as T };
}

export type ClientOptions = string | HttpClientOptions;

export function resolveClientOptions(options: ClientOptions): HttpClientOptions {
  if (typeof options === "string") {
    return { apiKey: options };
  }

  return options;
}
