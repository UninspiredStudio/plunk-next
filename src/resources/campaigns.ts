import type { HttpClient } from "../http.ts";
import { toQueryParams, unwrapEnvelopeResult } from "../http.ts";
import type {
  Campaign,
  CampaignStats,
  CreateCampaignRequest,
  ListCampaignsParams,
  ListCampaignsResponse,
  SendCampaignRequest,
  SendCampaignResponse,
  TestCampaignRequest,
  UpdateCampaignRequest,
} from "../types/campaigns.ts";

export class CampaignsResource {
  constructor(private readonly http: HttpClient) {}

  list(params?: ListCampaignsParams): Promise<ListCampaignsResponse> {
    return this.http.request<ListCampaignsResponse>({
      method: "GET",
      path: "/campaigns",
      query: toQueryParams(params),
    });
  }

  create(body: CreateCampaignRequest): Promise<Campaign> {
    return this.http.request<Campaign>({
      method: "POST",
      path: "/campaigns",
      body,
      unwrapEnvelope: true,
    });
  }

  get(id: string): Promise<Campaign> {
    return this.http.request<Campaign>({
      method: "GET",
      path: `/campaigns/${id}`,
      unwrapEnvelope: true,
    });
  }

  update(id: string, body: UpdateCampaignRequest): Promise<Campaign> {
    return this.http.request<Campaign>({
      method: "PUT",
      path: `/campaigns/${id}`,
      body,
      unwrapEnvelope: true,
    });
  }

  delete(id: string): Promise<void> {
    return this.http.request<void>({
      method: "DELETE",
      path: `/campaigns/${id}`,
    });
  }

  duplicate(id: string): Promise<Campaign> {
    return this.http.request<Campaign>({
      method: "POST",
      path: `/campaigns/${id}/duplicate`,
      body: {},
      unwrapEnvelope: true,
    });
  }

  async send(
    id: string,
    body?: SendCampaignRequest,
  ): Promise<SendCampaignResponse> {
    const json = await this.http.request<unknown>({
      method: "POST",
      path: `/campaigns/${id}/send`,
      body: body ?? {},
    });

    return unwrapEnvelopeResult<Campaign>(json);
  }

  cancel(id: string): Promise<Campaign> {
    return this.http.request<Campaign>({
      method: "POST",
      path: `/campaigns/${id}/cancel`,
      body: {},
      unwrapEnvelope: true,
    });
  }

  test(id: string, body: TestCampaignRequest): Promise<void> {
    return this.http.request<void>({
      method: "POST",
      path: `/campaigns/${id}/test`,
      body,
    });
  }

  stats(id: string): Promise<CampaignStats> {
    return this.http.request<CampaignStats>({
      method: "GET",
      path: `/campaigns/${id}/stats`,
      unwrapEnvelope: true,
    });
  }
}
