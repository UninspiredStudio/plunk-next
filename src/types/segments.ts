import type { FilterCondition, OffsetPage } from "./common.ts";
import type { Contact } from "./contacts.ts";

export type SegmentType = "DYNAMIC" | "STATIC";

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  type: SegmentType;
  condition: FilterCondition | null;
  trackMembership: boolean;
  memberCount: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSegmentRequest {
  name: string;
  description?: string;
  type?: SegmentType;
  condition?: FilterCondition;
  trackMembership?: boolean;
}

export interface UpdateSegmentRequest {
  name?: string;
  description?: string;
  condition?: FilterCondition;
  trackMembership?: boolean;
}

export interface ListSegmentContactsParams {
  page?: number;
  pageSize?: number;
}

export type ListSegmentContactsResponse = OffsetPage<Contact>;

export interface AddSegmentMembersRequest {
  emails: string[];
  createMissing?: boolean;
  subscribed?: boolean;
}

export interface AddSegmentMembersResponse {
  added: number;
  created: number;
  notFound: string[];
}

export interface RemoveSegmentMembersRequest {
  emails: string[];
}

export interface RemoveSegmentMembersResponse {
  removed: number;
}

export interface RefreshSegmentResponse {
  memberCount: number;
}

export interface ComputeSegmentResponse {
  added: number;
  removed: number;
  total: number;
}
