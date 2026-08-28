import type {
  EmailType,
  FilterCondition,
  OffsetPage,
  SortDirection,
} from "./common.ts";

export type CampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "SENDING"
  | "SENT"
  | "CANCELLED";

export type AudienceType = "ALL" | "SEGMENT" | "FILTERED";

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  body: string;
  from: string;
  fromName: string | null;
  replyTo: string | null;
  type: EmailType;
  status: CampaignStatus;
  audienceType: AudienceType;
  audienceCondition: FilterCondition | null;
  segmentId: string | null;
  scheduledFor: string | null;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  complainedCount?: number;
  unsubscribedCount?: number;
  projectId: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  subject: string;
  body: string;
  from: string;
  fromName?: string;
  replyTo?: string;
  type?: EmailType;
  audienceType: AudienceType;
  segmentId?: string;
  audienceCondition?: FilterCondition;
}

export type UpdateCampaignRequest = CreateCampaignRequest;

export interface SendCampaignRequest {
  scheduledFor?: string | null;
}

export interface SendCampaignResponse {
  data: Campaign;
  message?: string;
}

export interface TestCampaignRequest {
  email: string;
}

export interface CampaignStats {
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  complainedCount: number;
  unsubscribedCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  deliveryRate: number;
  complaintRate: number;
  unsubscribeRate: number;
}

export interface ListCampaignsParams {
  page?: number;
  pageSize?: number;
  status?: CampaignStatus;
  search?: string;
  sort?: "name" | "createdAt" | "updatedAt";
  dir?: SortDirection;
}

export type ListCampaignsResponse = OffsetPage<Campaign>;
