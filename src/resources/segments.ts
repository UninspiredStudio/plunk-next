import type { HttpClient } from "../http.ts";
import { toQueryParams } from "../http.ts";
import type {
  AddSegmentMembersRequest,
  AddSegmentMembersResponse,
  ComputeSegmentResponse,
  CreateSegmentRequest,
  ListSegmentContactsParams,
  ListSegmentContactsResponse,
  RefreshSegmentResponse,
  RemoveSegmentMembersRequest,
  RemoveSegmentMembersResponse,
  Segment,
  UpdateSegmentRequest,
} from "../types/segments.ts";

export class SegmentsResource {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<Segment[]> {
    return this.http.request<Segment[]>({
      method: "GET",
      path: "/segments",
    });
  }

  create(body: CreateSegmentRequest): Promise<Segment> {
    return this.http.request<Segment>({
      method: "POST",
      path: "/segments",
      body,
    });
  }

  get(id: string): Promise<Segment> {
    return this.http.request<Segment>({
      method: "GET",
      path: `/segments/${id}`,
    });
  }

  update(id: string, body: UpdateSegmentRequest): Promise<Segment> {
    return this.http.request<Segment>({
      method: "PATCH",
      path: `/segments/${id}`,
      body,
    });
  }

  delete(id: string): Promise<void> {
    return this.http.request<void>({
      method: "DELETE",
      path: `/segments/${id}`,
    });
  }

  listContacts(
    id: string,
    params?: ListSegmentContactsParams,
  ): Promise<ListSegmentContactsResponse> {
    return this.http.request<ListSegmentContactsResponse>({
      method: "GET",
      path: `/segments/${id}/contacts`,
      query: toQueryParams(params),
    });
  }

  addMembers(
    id: string,
    body: AddSegmentMembersRequest,
  ): Promise<AddSegmentMembersResponse> {
    return this.http.request<AddSegmentMembersResponse>({
      method: "POST",
      path: `/segments/${id}/members`,
      body,
    });
  }

  removeMembers(
    id: string,
    body: RemoveSegmentMembersRequest,
  ): Promise<RemoveSegmentMembersResponse> {
    return this.http.request<RemoveSegmentMembersResponse>({
      method: "DELETE",
      path: `/segments/${id}/members`,
      body,
    });
  }

  compute(id: string): Promise<ComputeSegmentResponse> {
    return this.http.request<ComputeSegmentResponse>({
      method: "POST",
      path: `/segments/${id}/compute`,
      body: {},
    });
  }

  refresh(id: string): Promise<RefreshSegmentResponse> {
    return this.http.request<RefreshSegmentResponse>({
      method: "POST",
      path: `/segments/${id}/refresh`,
      body: {},
    });
  }
}
