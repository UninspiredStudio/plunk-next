import { HttpClient, resolveClientOptions, type ClientOptions } from "./http.ts";
import type {
  RequestOptions,
  TrackRequest,
  TrackResponse,
} from "./types/public.ts";

export class PlunkPublicClient {
  private readonly http: HttpClient;

  constructor(options: ClientOptions) {
    const resolved = resolveClientOptions(options);
    this.http = new HttpClient(resolved);
  }

  async track(
    body: TrackRequest,
    options?: RequestOptions,
  ): Promise<TrackResponse> {
    return this.http.request<TrackResponse>({
      method: "POST",
      path: "/v1/track",
      body,
      unwrapEnvelope: true,
      headers: idempotencyHeaders(options),
    });
  }
}

function idempotencyHeaders(
  options?: RequestOptions,
): Record<string, string> | undefined {
  if (!options?.idempotencyKey) {
    return undefined;
  }

  return { "Idempotency-Key": options.idempotencyKey };
}
