import type { HttpClient } from "../http.ts";
import { toQueryParams } from "../http.ts";
import type {
  CreateTemplateRequest,
  ListTemplatesParams,
  ListTemplatesResponse,
  Template,
  TemplateUsage,
  UpdateTemplateRequest,
} from "../types/templates.ts";

export class TemplatesResource {
  constructor(private readonly http: HttpClient) {}

  list(params?: ListTemplatesParams): Promise<ListTemplatesResponse> {
    return this.http.request<ListTemplatesResponse>({
      method: "GET",
      path: "/templates",
      query: toQueryParams(params),
    });
  }

  create(body: CreateTemplateRequest): Promise<Template> {
    return this.http.request<Template>({
      method: "POST",
      path: "/templates",
      body,
    });
  }

  get(id: string): Promise<Template> {
    return this.http.request<Template>({
      method: "GET",
      path: `/templates/${id}`,
    });
  }

  update(id: string, body: UpdateTemplateRequest): Promise<Template> {
    return this.http.request<Template>({
      method: "PATCH",
      path: `/templates/${id}`,
      body,
    });
  }

  delete(id: string): Promise<void> {
    return this.http.request<void>({
      method: "DELETE",
      path: `/templates/${id}`,
    });
  }

  duplicate(id: string): Promise<Template> {
    return this.http.request<Template>({
      method: "POST",
      path: `/templates/${id}/duplicate`,
      body: {},
    });
  }

  usage(id: string): Promise<TemplateUsage> {
    return this.http.request<TemplateUsage>({
      method: "GET",
      path: `/templates/${id}/usage`,
    });
  }
}
