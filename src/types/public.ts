export interface EmailAddress {
  name?: string;
  email: string;
}

export type EmailRecipient = string | EmailAddress;

export interface NonPersistentDataValue {
  value: unknown;
  persistent: false;
}

export type ContactDataValue = unknown | null | NonPersistentDataValue;

export type ContactData = Record<string, ContactDataValue>;

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
  contentId?: string;
  disposition?: "attachment" | "inline";
}

export interface TrackRequest {
  email: string;
  event: string;
  subscribed?: boolean;
  data?: ContactData;
}

export interface TrackResponse {
  contact: string;
  event: string;
  timestamp: string;
}

export interface SendRequest {
  to: EmailRecipient | EmailRecipient[];
  subject?: string;
  body?: string;
  template?: string;
  from?: EmailRecipient;
  /** @deprecated Prefer `from: { name, email }` */
  name?: string;
  subscribed?: boolean;
  data?: ContactData;
  headers?: Record<string, string>;
  reply?: string;
  attachments?: EmailAttachment[];
}

export interface SendEmailResult {
  contact: {
    id: string;
    email: string;
  };
  email: string;
}

export interface SendResponse {
  emails: SendEmailResult[];
  timestamp: string;
}

export interface VerifyRequest {
  email: string;
}

export interface VerifyResponse {
  email: string;
  valid: boolean;
  isDisposable: boolean;
  isAlias: boolean;
  isTypo: boolean;
  isPlusAddressed: boolean;
  isPersonalEmail: boolean;
  domainExists: boolean;
  hasWebsite: boolean;
  hasMxRecords: boolean;
  suggestedEmail?: string | null;
  reasons: string[];
}

export interface RequestOptions {
  idempotencyKey?: string;
}
