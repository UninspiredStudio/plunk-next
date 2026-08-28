# @uninspired/plunk-next

TypeScript client for the [Plunk Next API](https://next-api.useplunk.com). Send transactional email, track events, and manage contacts, templates, campaigns, and segments.

Zero runtime dependencies. Works in Node.js 18+ and any other runtime with a global `fetch`. Ships ESM and CommonJS, with generated TypeScript types.

## Installation

```bash
npm install @uninspired/plunk-next
# or
bun add @uninspired/plunk-next
# or
pnpm add @uninspired/plunk-next
# or
yarn add @uninspired/plunk-next
```

Create a [Plunk](https://www.useplunk.com) project and copy your **secret** (`sk_…`) and **public** (`pk_…`) API keys from the dashboard.

## Usage

### Create a client

`PlunkClient` uses a secret key for sending mail and managing resources. `PlunkPublicClient` uses a public key for event tracking.

```ts
import { PlunkClient, PlunkPublicClient } from "@uninspired/plunk-next";

const client = new PlunkClient("sk_your_secret_key");
const publicClient = new PlunkPublicClient("pk_your_public_key");
```

Pass an options object when you need a custom base URL (self-hosted or staging):

```ts
const client = new PlunkClient({
  apiKey: "sk_your_secret_key",
  baseUrl: "https://next-api.useplunk.com", // default
});
```

### Send email

```ts
const result = await client.send({
  to: "user@example.com",
  from: "hello@your-verified-domain.com",
  subject: "Welcome",
  body: "<p>Thanks for signing up.</p>",
});

console.log(result.emails[0]?.email);
```

`to` and `from` accept a string, `{ name, email }`, or an array of either. You can also send from a saved template, attach files, and pass contact `data`:

```ts
await client.send(
  {
    to: [{ name: "Ada", email: "ada@example.com" }],
    from: { name: "Acme", email: "hello@acme.com" },
    template: "tmpl_welcome",
    reply: "support@acme.com",
    subscribed: true,
    data: { plan: "pro" },
    attachments: [
      {
        filename: "invoice.pdf",
        content: pdfBase64,
        contentType: "application/pdf",
      },
    ],
  },
  { idempotencyKey: "welcome-ada-2026-08-28" },
);
```

### Track events

Use the public client from browsers or other untrusted contexts.

```ts
await publicClient.track(
  {
    email: "user@example.com",
    event: "signup",
    subscribed: true,
    data: { source: "landing" },
  },
  { idempotencyKey: "signup-user@example.com" },
);
```

Set `persistent: false` on a data value to attach it to this event only, without writing it onto the contact:

```ts
await publicClient.track({
  email: "user@example.com",
  event: "checkout",
  data: {
    plan: "pro",
    cartTotal: { value: 49, persistent: false },
  },
});
```

### Verify an address

```ts
const check = await client.verify({ email: "user@gmail.com" });

if (!check.valid) {
  console.log(check.reasons, check.suggestedEmail);
}
```

### Contacts

Contacts use cursor pagination. Custom fields live on `data`.

```ts
const created = await client.contacts.create({
  email: "ada@example.com",
  subscribed: true,
  data: { plan: "pro" },
});

await client.contacts.update(created.id, { data: { plan: "enterprise" } });

const page = await client.contacts.list({
  limit: 50,
  search: "ada",
  subscribed: true,
  sort: "createdAt",
  dir: "desc",
});

const { found, notFound } = await client.contacts.lookup({
  emails: ["ada@example.com", "missing@example.com"],
});

await client.contacts.delete(created.id);
```

Import a CSV, then poll the job:

```ts
const { jobId } = await client.contacts.import(new Blob([csv], { type: "text/csv" }));
const status = await client.contacts.getImportStatus(jobId);
```

Bulk subscribe, unsubscribe, or delete by contact IDs or by query:

```ts
const { jobId } = await client.contacts.bulkSubscribe({
  mode: "query",
  subscribed: false,
});

await client.contacts.getBulkStatus(jobId);
```

Field catalog helpers: `listFields()`, `listFieldValues(field)`, `getFieldUsage(field)`, `deleteField(field)`.

### Templates

Templates use offset pagination.

```ts
const template = await client.templates.create({
  name: "Welcome",
  subject: "Welcome to Acme",
  body: "<p>Hello {{email}}</p>",
  from: "hello@acme.com",
  type: "TRANSACTIONAL",
});

await client.templates.update(template.id, { subject: "Welcome aboard" });
await client.templates.duplicate(template.id);
await client.templates.usage(template.id);
await client.templates.delete(template.id);
```

### Campaigns

```ts
const campaign = await client.campaigns.create({
  name: "August newsletter",
  subject: "What’s new",
  body: "<p>Hello</p>",
  from: "hello@acme.com",
  audienceType: "ALL",
});

await client.campaigns.test(campaign.id, { email: "you@example.com" });

const scheduled = await client.campaigns.send(campaign.id, {
  scheduledFor: new Date(Date.now() + 86_400_000).toISOString(),
});

await client.campaigns.cancel(campaign.id);
await client.campaigns.stats(campaign.id);
```

`audienceType` is `"ALL"`, `"SEGMENT"` (with `segmentId`), or `"FILTERED"` (with `audienceCondition`).

### Segments

Dynamic segments are defined by a filter condition. Static segments are managed by adding and removing emails.

```ts
const dynamic = await client.segments.create({
  name: "Subscribed",
  type: "DYNAMIC",
  condition: {
    logic: "AND",
    groups: [
      { filters: [{ field: "subscribed", operator: "equals", value: true }] },
    ],
  },
});

await client.segments.refresh(dynamic.id);
await client.segments.compute(dynamic.id);

const staticSeg = await client.segments.create({
  name: "Beta testers",
  type: "STATIC",
});

await client.segments.addMembers(staticSeg.id, {
  emails: ["ada@example.com"],
  createMissing: true,
  subscribed: true,
});

await client.segments.listContacts(staticSeg.id, { page: 1, pageSize: 50 });
await client.segments.removeMembers(staticSeg.id, { emails: ["ada@example.com"] });
```

### Errors

Non-2xx responses throw `PlunkError`.

```ts
import { PlunkError } from "@uninspired/plunk-next";

try {
  await client.send({ to: "not-an-email", subject: "Hi", body: "<p>Hi</p>" });
} catch (error) {
  if (error instanceof PlunkError) {
    console.error(error.code, error.statusCode, error.requestId);
    console.error(error.errors, error.suggestion);
  }
}
```

### CommonJS

```js
const { PlunkClient, PlunkPublicClient } = require("@uninspired/plunk-next");

const client = new PlunkClient("sk_your_secret_key");
```

## API

### Clients

| Export | Key | Purpose |
| --- | --- | --- |
| `PlunkClient` | secret (`sk_…`) | Send, verify, contacts, templates, campaigns, segments |
| `PlunkPublicClient` | public (`pk_…`) | Track events |
| `PlunkError` | — | Thrown on non-2xx responses |
| `DEFAULT_BASE_URL` | — | `https://next-api.useplunk.com` |

Constructor argument: a key string, or `{ apiKey, baseUrl? }`.

`send` and `track` take an optional second argument `{ idempotencyKey }` which is sent as the `Idempotency-Key` header.

### `PlunkClient`

| Method | Description |
| --- | --- |
| `send(body, options?)` | Send transactional email |
| `verify(body)` | Validate an email address |

### `client.contacts`

| Method | Description |
| --- | --- |
| `list(params?)` | Cursor-paginated list (`limit`, `cursor`, `search`, `subscribed`, `sort`, `dir`) |
| `create(body)` | Create a contact |
| `get(id)` | Fetch one contact |
| `update(id, body)` | Patch email, subscribed, or data |
| `delete(id)` | Delete a contact |
| `lookup({ emails })` | Split addresses into found / not found |
| `listFields()` | Custom field catalog |
| `listFieldValues(field)` | Distinct values for a field |
| `getFieldUsage(field)` | Segments/campaigns using a field |
| `deleteField(field)` | Remove a custom field |
| `import(file)` | CSV import; returns `{ jobId }` |
| `getImportStatus(jobId)` | Poll an import job |
| `bulkSubscribe(body)` / `bulkUnsubscribe(body)` / `bulkDelete(body)` | Bulk jobs by `ids` or `query` |
| `getBulkStatus(jobId)` | Poll a bulk job |

### `client.templates`

| Method | Description |
| --- | --- |
| `list(params?)` | Offset-paginated list |
| `create(body)` | Create a template |
| `get(id)` / `update(id, body)` / `delete(id)` | CRUD |
| `duplicate(id)` | Copy a template |
| `usage(id)` | Workflow and send counts |

### `client.campaigns`

| Method | Description |
| --- | --- |
| `list(params?)` | Offset-paginated list |
| `create(body)` | Create a campaign |
| `get(id)` / `update(id, body)` / `delete(id)` | CRUD |
| `duplicate(id)` | Copy a campaign |
| `send(id, body?)` | Send now, or schedule with `scheduledFor` |
| `cancel(id)` | Cancel a scheduled send |
| `test(id, { email })` | Send a test copy |
| `stats(id)` | Delivery and engagement rates |

### `client.segments`

| Method | Description |
| --- | --- |
| `list()` | All segments |
| `create(body)` | Create a `DYNAMIC` or `STATIC` segment |
| `get(id)` / `update(id, body)` / `delete(id)` | CRUD |
| `listContacts(id, params?)` | Members, offset-paginated |
| `addMembers(id, body)` / `removeMembers(id, body)` | Static membership |
| `compute(id)` | Re-evaluate a dynamic segment |
| `refresh(id)` | Refresh member count |

Request and response types (`SendRequest`, `Contact`, `Campaign`, `FilterCondition`, and so on) are exported from the package.

## Development

This repo uses [Bun](https://bun.sh). Node.js 18+ is enough to consume the published package.

```bash
bun install
```

### Scripts

| Command | What it does |
| --- | --- |
| `bun run build` | Bundle ESM, CJS, and `.d.ts` into `dist/` via tsup |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | oxlint |
| `bun run lint:fix` | oxlint with `--fix` |
| `bun test` | Integration tests |
| `bun run check` | typecheck + lint + test |

`prepublishOnly` runs the build, so `npm publish` always ships a fresh `dist/`.

### Tests

Tests hit the live Plunk Next API and **skip** when the required env vars are missing. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

```
PLUNK_SECRET_KEY=sk_your_secret_key
PLUNK_PUBLIC_KEY=pk_your_public_key
PLUNK_TEST_EMAIL=you@example.com
PLUNK_TEST_FROM=hello@your-verified-domain.com
```

- `PLUNK_SECRET_KEY` — most suites
- `PLUNK_PUBLIC_KEY` — `track`
- `PLUNK_TEST_FROM` — send, templates, and campaigns (must be a verified domain)
- `PLUNK_TEST_EMAIL` — recipient for send/test; defaults to a throwaway `@example.com` address

Suites clean up contacts, templates, campaigns, and segments they create. Campaign tests can take up to 60 seconds.

Without keys, `bun test` still exits 0: every case is skipped rather than failed.

### Layout

```
src/
  index.ts              public exports
  private-client.ts     PlunkClient
  public-client.ts      PlunkPublicClient
  http.ts               fetch wrapper
  errors.ts             PlunkError
  resources/            contacts, templates, campaigns, segments
  types/                request/response types
tests/                  live API tests
```

## License

[MIT](LICENSE)
