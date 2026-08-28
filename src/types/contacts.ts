import type { CursorPage, SortDirection } from "./common.ts";

export interface Contact {
  id: string;
  email: string;
  subscribed: boolean;
  data?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMeta {
  isNew: boolean;
  isUpdate: boolean;
}

export interface ContactWithMeta extends Contact {
  _meta?: ContactMeta;
}

export interface CreateContactRequest {
  email: string;
  subscribed?: boolean;
  data?: Record<string, unknown>;
}

export interface UpdateContactRequest {
  email?: string;
  subscribed?: boolean;
  data?: Record<string, unknown>;
}

export interface ListContactsParams {
  limit?: number;
  cursor?: string;
  search?: string;
  subscribed?: boolean;
  sort?: "email" | "createdAt";
  dir?: SortDirection;
}

export type ListContactsResponse = CursorPage<Contact>;

export interface LookupContactsRequest {
  emails: string[];
}

export interface LookupContactsResponse {
  found: string[];
  notFound: string[];
}

export interface ContactField {
  field: string;
  type: string;
  coverage: number;
}

export interface ListContactFieldsResponse {
  fields: ContactField[];
  count: number;
}

export interface ListContactFieldValuesResponse {
  field: string;
  values: unknown[];
  count: number;
  limit: number;
}

export interface ContactFieldUsageResponse {
  usedInSegments: string[];
  usedInCampaigns: string[];
  contactCount: number;
  canDelete: boolean;
}

export interface DeleteContactFieldResponse {
  deletedFrom: number;
}

export interface ImportContactsResponse {
  message: string;
  jobId: string;
}

export interface ImportJobError {
  row?: number;
  email?: string;
  reason: string;
}

export interface ImportJobResult {
  totalRows: number;
  successCount: number;
  createdCount: number;
  updatedCount: number;
  failureCount: number;
  errors: ImportJobError[];
}

export interface ImportJobStatus {
  id: string;
  state: string;
  progress: number;
  result?: ImportJobResult;
  data?: Record<string, unknown>;
}

export interface BulkContactIdsRequest {
  mode: "ids";
  contactIds: string[];
}

export interface BulkContactQueryRequest {
  mode: "query";
  search?: string;
  subscribed?: boolean;
}

export type BulkContactRequest =
  | BulkContactIdsRequest
  | BulkContactQueryRequest;

export interface BulkJobResponse {
  message: string;
  jobId: string;
}

export interface BulkJobError {
  contactId?: string;
  email?: string;
  reason: string;
}

export interface BulkJobResult {
  operation: string;
  totalRequested: number;
  successCount: number;
  unchangedCount: number;
  failureCount: number;
  errors: BulkJobError[];
}

export interface BulkJobStatus {
  id: string;
  state: string;
  progress: number;
  result?: BulkJobResult;
  data?: Record<string, unknown>;
}
