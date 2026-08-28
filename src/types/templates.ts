import type { EmailType, OffsetPage, SortDirection } from "./common.ts";

export interface Template {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  body: string;
  from: string;
  fromName: string | null;
  replyTo: string | null;
  type: EmailType;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  subject: string;
  body: string;
  from: string;
  fromName?: string;
  replyTo?: string;
  type?: EmailType;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  subject?: string;
  body?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  type?: EmailType;
}

export interface ListTemplatesParams {
  page?: number;
  pageSize?: number;
  type?: EmailType;
  search?: string;
  sort?: "name" | "createdAt" | "updatedAt";
  dir?: SortDirection;
}

export type ListTemplatesResponse = OffsetPage<Template>;

export interface TemplateUsage {
  workflowSteps: number;
  emailsSent: number;
}
