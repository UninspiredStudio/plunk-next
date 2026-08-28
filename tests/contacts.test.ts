import { afterAll, describe, expect, test } from "bun:test";
import { PlunkClient } from "../src/index.ts";
import {
  hasSecretKey,
  hasTestFrom,
  secretKey,
  testEmail,
  testFrom,
} from "./setup.ts";

describe("contacts", () => {
  let contactId: string | undefined;
  let importContactEmail: string | undefined;

  afterAll(async () => {
    if (!hasSecretKey()) {
      return;
    }

    const client = new PlunkClient(secretKey!);

    if (contactId) {
      await client.contacts.delete(contactId);
    }

    if (importContactEmail) {
      const list = await client.contacts.list({ search: importContactEmail, limit: 5 });
      for (const contact of list.data) {
        await client.contacts.delete(contact.id);
      }
    }
  });

  test.skipIf(!hasSecretKey())("list", async () => {
    const client = new PlunkClient(secretKey!);
    const list = await client.contacts.list({
      limit: 10,
      sort: "createdAt",
      dir: "desc",
    });

    expect(list.data).toBeArray();
    expect(list.hasMore).toBeBoolean();
    expect(list.total).toBeNumber();
  });

  test.skipIf(!hasSecretKey())("create, get, update, delete", async () => {
    const client = new PlunkClient(secretKey!);
    const uniqueEmail = `plunk-contact-${Date.now()}@example.com`;

    const created = await client.contacts.create({
      email: uniqueEmail,
      subscribed: true,
      data: { plan: "test", sdkField: "alpha" },
    });

    expect(created.email).toBe(uniqueEmail);
    expect(created.id).toBeString();
    contactId = created.id;

    const fetched = await client.contacts.get(created.id);
    expect(fetched.email).toBe(uniqueEmail);
    expect(fetched.data?.plan).toBe("test");

    const updated = await client.contacts.update(created.id, {
      data: { plan: "premium" },
    });
    expect(updated.data?.plan).toBe("premium");

    const list = await client.contacts.list({ search: uniqueEmail, limit: 5 });
    expect(list.data.some((contact) => contact.id === created.id)).toBe(true);
  });

  test.skipIf(!hasSecretKey())("lookup", async () => {
    const client = new PlunkClient(secretKey!);
    const result = await client.contacts.lookup({
      emails: [testEmail, `missing-${Date.now()}@example.com`],
    });

    expect(result.found).toBeArray();
    expect(result.notFound).toBeArray();
    expect(result.found.includes(testEmail)).toBe(true);
  });

  test.skipIf(!hasSecretKey())("fields", async () => {
    const client = new PlunkClient(secretKey!);
    const fields = await client.contacts.listFields();

    expect(fields.fields).toBeArray();
    expect(fields.count).toBeNumber();
    expect(fields.fields.some((field) => field.field === "email")).toBe(true);

    const customField = fields.fields.find((field) => field.field.startsWith("data."));
    if (!customField) {
      return;
    }

    const values = await client.contacts.listFieldValues(customField.field);
    expect(values.field).toBe(customField.field);
    expect(values.values).toBeArray();

    const usage = await client.contacts.getFieldUsage(customField.field);
    expect(usage.usedInSegments).toBeArray();
    expect(usage.usedInCampaigns).toBeArray();
    expect(usage.contactCount).toBeNumber();
    expect(usage.canDelete).toBeBoolean();
  });

  test.skipIf(!hasSecretKey())("import and import status", async () => {
    const client = new PlunkClient(secretKey!);
    importContactEmail = `plunk-import-${Date.now()}@example.com`;
    const csv = `email\n${importContactEmail}\n`;

    const queued = await client.contacts.import(
      new Blob([csv], { type: "text/csv" }),
    );

    expect(queued.jobId).toBeString();
    expect(queued.message).toBeString();

    const status = await client.contacts.getImportStatus(queued.jobId);
    expect(status.id).toBe(queued.jobId);
    expect(status.state).toBeString();
    expect(status.progress).toBeNumber();
  });

  test.skipIf(!hasSecretKey())("bulk operations", async () => {
    const client = new PlunkClient(secretKey!);
    const created = await client.contacts.create({
      email: `plunk-bulk-${Date.now()}@example.com`,
      subscribed: true,
    });

    const subscribeJob = await client.contacts.bulkSubscribe({
      mode: "ids",
      contactIds: [created.id],
    });
    expect(subscribeJob.jobId).toBeString();

    const unsubscribeJob = await client.contacts.bulkUnsubscribe({
      mode: "ids",
      contactIds: [created.id],
    });
    expect(unsubscribeJob.jobId).toBeString();

    const status = await client.contacts.getBulkStatus(unsubscribeJob.jobId);
    expect(status.id).toBe(unsubscribeJob.jobId);

    const deleteJob = await client.contacts.bulkDelete({
      mode: "ids",
      contactIds: [created.id],
    });
    expect(deleteJob.jobId).toBeString();
  });

  test.skipIf(!hasSecretKey())("delete field", async () => {
    const client = new PlunkClient(secretKey!);
    const fieldName = `tempSdkField${Date.now()}`;
    const created = await client.contacts.create({
      email: `plunk-field-${Date.now()}@example.com`,
      data: { [fieldName]: "value" },
    });

    const deleted = await client.contacts.deleteField(`data.${fieldName}`);
    expect(deleted.deletedFrom).toBeNumber();

    await client.contacts.delete(created.id);
  });
});
