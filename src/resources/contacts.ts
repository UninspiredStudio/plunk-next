import type { HttpClient } from "../http.ts";
import { toQueryParams } from "../http.ts";
import type {
  BulkContactRequest,
  BulkJobResponse,
  BulkJobStatus,
  Contact,
  ContactFieldUsageResponse,
  ContactWithMeta,
  CreateContactRequest,
  DeleteContactFieldResponse,
  ImportContactsResponse,
  ImportJobStatus,
  ListContactFieldValuesResponse,
  ListContactFieldsResponse,
  ListContactsParams,
  ListContactsResponse,
  LookupContactsRequest,
  LookupContactsResponse,
  UpdateContactRequest,
} from "../types/contacts.ts";

export class ContactsResource {
  constructor(private readonly http: HttpClient) {}

  list(params?: ListContactsParams): Promise<ListContactsResponse> {
    return this.http.request<ListContactsResponse>({
      method: "GET",
      path: "/contacts",
      query: toQueryParams(params),
    });
  }

  create(body: CreateContactRequest): Promise<ContactWithMeta> {
    return this.http.request<ContactWithMeta>({
      method: "POST",
      path: "/contacts",
      body,
    });
  }

  get(id: string): Promise<Contact> {
    return this.http.request<Contact>({
      method: "GET",
      path: `/contacts/${id}`,
    });
  }

  update(id: string, body: UpdateContactRequest): Promise<Contact> {
    return this.http.request<Contact>({
      method: "PATCH",
      path: `/contacts/${id}`,
      body,
    });
  }

  delete(id: string): Promise<void> {
    return this.http.request<void>({
      method: "DELETE",
      path: `/contacts/${id}`,
    });
  }

  lookup(body: LookupContactsRequest): Promise<LookupContactsResponse> {
    return this.http.request<LookupContactsResponse>({
      method: "POST",
      path: "/contacts/lookup",
      body,
    });
  }

  listFields(): Promise<ListContactFieldsResponse> {
    return this.http.request<ListContactFieldsResponse>({
      method: "GET",
      path: "/contacts/fields",
    });
  }

  listFieldValues(field: string): Promise<ListContactFieldValuesResponse> {
    return this.http.request<ListContactFieldValuesResponse>({
      method: "GET",
      path: `/contacts/fields/${encodeURIComponent(field)}/values`,
    });
  }

  getFieldUsage(field: string): Promise<ContactFieldUsageResponse> {
    return this.http.request<ContactFieldUsageResponse>({
      method: "GET",
      path: `/contacts/fields/${encodeURIComponent(field)}/usage`,
    });
  }

  deleteField(field: string): Promise<DeleteContactFieldResponse> {
    return this.http.request<DeleteContactFieldResponse>({
      method: "DELETE",
      path: `/contacts/fields/${encodeURIComponent(field)}`,
    });
  }

  import(file: Blob): Promise<ImportContactsResponse> {
    const formData = new FormData();
    formData.append("file", file, "contacts.csv");

    return this.http.request<ImportContactsResponse>({
      method: "POST",
      path: "/contacts/import",
      formData,
    });
  }

  getImportStatus(jobId: string): Promise<ImportJobStatus> {
    return this.http.request<ImportJobStatus>({
      method: "GET",
      path: `/contacts/import/${jobId}`,
    });
  }

  bulkSubscribe(body: BulkContactRequest): Promise<BulkJobResponse> {
    return this.http.request<BulkJobResponse>({
      method: "POST",
      path: "/contacts/bulk-subscribe",
      body,
    });
  }

  bulkUnsubscribe(body: BulkContactRequest): Promise<BulkJobResponse> {
    return this.http.request<BulkJobResponse>({
      method: "POST",
      path: "/contacts/bulk-unsubscribe",
      body,
    });
  }

  bulkDelete(body: BulkContactRequest): Promise<BulkJobResponse> {
    return this.http.request<BulkJobResponse>({
      method: "POST",
      path: "/contacts/bulk-delete",
      body,
    });
  }

  getBulkStatus(jobId: string): Promise<BulkJobStatus> {
    return this.http.request<BulkJobStatus>({
      method: "GET",
      path: `/contacts/bulk/${jobId}`,
    });
  }
}
