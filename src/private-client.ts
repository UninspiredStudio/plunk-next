import { HttpClient, resolveClientOptions, type ClientOptions } from "./http.ts";
import { CampaignsResource } from "./resources/campaigns.ts";
import { ContactsResource } from "./resources/contacts.ts";
import { SegmentsResource } from "./resources/segments.ts";
import { TemplatesResource } from "./resources/templates.ts";
import type {
  RequestOptions,
  SendRequest,
  SendResponse,
  VerifyRequest,
  VerifyResponse,
} from "./types/public.ts";

export class PlunkClient {
  private readonly http: HttpClient;

  readonly contacts: ContactsResource;
  readonly templates: TemplatesResource;
  readonly campaigns: CampaignsResource;
  readonly segments: SegmentsResource;

  constructor(options: ClientOptions) {
    const resolved = resolveClientOptions(options);
    this.http = new HttpClient(resolved);

    this.contacts = new ContactsResource(this.http);
    this.templates = new TemplatesResource(this.http);
    this.campaigns = new CampaignsResource(this.http);
    this.segments = new SegmentsResource(this.http);
  }

  async send(
    body: SendRequest,
    options?: RequestOptions,
  ): Promise<SendResponse> {
    return this.http.request<SendResponse>({
      method: "POST",
      path: "/v1/send",
      body,
      unwrapEnvelope: true,
      headers: idempotencyHeaders(options),
    });
  }

  async verify(body: VerifyRequest): Promise<VerifyResponse> {
    return this.http.request<VerifyResponse>({
      method: "POST",
      path: "/v1/verify",
      body,
      unwrapEnvelope: true,
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
