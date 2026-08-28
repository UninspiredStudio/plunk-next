export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "exists"
  | "notExists"
  | "within"
  | "olderThan"
  | "triggered"
  | "triggeredWithin"
  | "triggeredOlderThan"
  | "notTriggered"
  | "notTriggeredWithin"
  | "memberOfSegment"
  | "notMemberOfSegment";

export type FilterTimeUnit = "days" | "hours" | "minutes";

export type FilterLogic = "AND" | "OR";

export type SortDirection = "asc" | "desc";

export interface Filter {
  field: string;
  operator: FilterOperator;
  value?: unknown;
  unit?: FilterTimeUnit;
}

export interface FilterGroup {
  filters: Filter[];
  conditions?: FilterCondition;
}

export interface FilterCondition {
  logic: FilterLogic;
  groups: FilterGroup[];
}

export interface FieldError {
  field?: string;
  message?: string;
  code?: string;
  received?: unknown;
}

export interface PlunkErrorBody {
  success?: false;
  error?: {
    code?: string;
    message?: string;
    statusCode?: number;
    requestId?: string;
    errors?: FieldError[];
    details?: Record<string, unknown>;
    suggestion?: string;
  };
  timestamp?: string;
}

export interface LegacyErrorBody {
  error: string;
}

export type EmailType = "TRANSACTIONAL" | "MARKETING" | "HEADLESS";

export interface CursorPage<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
  total: number;
}

export interface OffsetPage<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
