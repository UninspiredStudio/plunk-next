import { afterAll, describe, expect, test } from "bun:test";
import { PlunkClient } from "../src/index.ts";
import {
  hasSecretKey,
  hasTestFrom,
  secretKey,
  testEmail,
  testFrom,
} from "./setup.ts";

describe("campaigns", () => {
  const campaignIds: string[] = [];

  afterAll(async () => {
    if (!hasSecretKey()) {
      return;
    }

    const client = new PlunkClient(secretKey!);
    for (const id of campaignIds) {
      try {
        await client.campaigns.delete(id);
      } catch {
        // campaign may already be deleted in test
      }
    }
  });

  test.skipIf(!hasSecretKey())("list", async () => {
    const client = new PlunkClient(secretKey!);
    const list = await client.campaigns.list({ page: 1, pageSize: 10 });

    expect(list.data).toBeArray();
    expect(list.total).toBeNumber();
    expect(list.page).toBeNumber();
    expect(list.pageSize).toBeNumber();
    expect(list.totalPages).toBeNumber();
  });

  test.skipIf(!hasSecretKey() || !hasTestFrom())(
    "create, get, update, duplicate, stats, test, delete",
    async () => {
      const client = new PlunkClient(secretKey!);
      const created = await client.campaigns.create({
        name: `sdk-campaign-${Date.now()}`,
        subject: "SDK campaign test",
        body: "<p>Campaign body</p>",
        from: testFrom!,
        audienceType: "ALL",
      });
      campaignIds.push(created.id);

      expect(created.status).toBe("DRAFT");

      const fetched = await client.campaigns.get(created.id);
      expect(fetched.id).toBe(created.id);

      const updated = await client.campaigns.update(created.id, {
        name: `${created.name} updated`,
        subject: created.subject,
        body: created.body,
        from: created.from,
        audienceType: "ALL",
      });
      expect(updated.name).toContain("updated");

      const duplicated = await client.campaigns.duplicate(created.id);
      campaignIds.push(duplicated.id);
      expect(duplicated.id).not.toBe(created.id);

      const stats = await client.campaigns.stats(created.id);
      expect(stats.totalRecipients).toBeNumber();
      expect(stats.sentCount).toBeNumber();

      await client.campaigns.test(created.id, { email: testEmail });

      await client.campaigns.delete(created.id);
      campaignIds.splice(campaignIds.indexOf(created.id), 1);
    },
    60_000,
  );

  test.skipIf(!hasSecretKey() || !hasTestFrom())(
    "schedule send and cancel",
    async () => {
      const client = new PlunkClient(secretKey!);
      const created = await client.campaigns.create({
        name: `sdk-schedule-${Date.now()}`,
        subject: "Scheduled campaign",
        body: "<p>Scheduled</p>",
        from: testFrom!,
        audienceType: "ALL",
      });
      campaignIds.push(created.id);

      const scheduledFor = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const sent = await client.campaigns.send(created.id, { scheduledFor });
      expect(sent.data.status).toBe("SCHEDULED");
      expect(sent.message).toBeString();

      const cancelled = await client.campaigns.cancel(created.id);
      expect(cancelled.status).toBe("CANCELLED");
    },
    30_000,
  );
});
