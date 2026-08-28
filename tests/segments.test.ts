import { afterAll, describe, expect, test } from "bun:test";
import { PlunkClient } from "../src/index.ts";
import { hasSecretKey, secretKey, testEmail } from "./setup.ts";

describe("segments", () => {
  const segmentIds: string[] = [];

  afterAll(async () => {
    if (!hasSecretKey()) {
      return;
    }

    const client = new PlunkClient(secretKey!);
    for (const id of segmentIds) {
      await client.segments.delete(id);
    }
  });

  test.skipIf(!hasSecretKey())("list", async () => {
    const client = new PlunkClient(secretKey!);
    const segments = await client.segments.list();

    expect(segments).toBeArray();
  });

  test.skipIf(!hasSecretKey())("create dynamic segment", async () => {
    const client = new PlunkClient(secretKey!);
    const created = await client.segments.create({
      name: `sdk-dynamic-${Date.now()}`,
      type: "DYNAMIC",
      condition: {
        logic: "AND",
        groups: [
          {
            filters: [{ field: "subscribed", operator: "equals", value: true }],
          },
        ],
      },
    });
    segmentIds.push(created.id);

    expect(created.type).toBe("DYNAMIC");
    expect(created.id).toBeString();

    const fetched = await client.segments.get(created.id);
    expect(fetched.id).toBe(created.id);

    const updated = await client.segments.update(created.id, {
      description: "Updated by SDK test",
    });
    expect(updated.description).toBe("Updated by SDK test");

    const refreshed = await client.segments.refresh(created.id);
    expect(refreshed.memberCount).toBeNumber();

    await client.segments.delete(created.id);
    segmentIds.splice(segmentIds.indexOf(created.id), 1);
  });

  test.skipIf(!hasSecretKey())("static segment members", async () => {
    const client = new PlunkClient(secretKey!);
    const created = await client.segments.create({
      name: `sdk-static-${Date.now()}`,
      type: "STATIC",
    });
    segmentIds.push(created.id);

    const added = await client.segments.addMembers(created.id, {
      emails: [testEmail],
    });
    expect(added.added).toBeNumber();

    const members = await client.segments.listContacts(created.id, {
      page: 1,
      pageSize: 10,
    });
    expect(members.data).toBeArray();
    expect(members.total).toBeNumber();

    const refreshed = await client.segments.refresh(created.id);
    expect(refreshed.memberCount).toBeGreaterThanOrEqual(0);

    const removed = await client.segments.removeMembers(created.id, {
      emails: [testEmail],
    });
    expect(removed.removed).toBeNumber();

    await client.segments.delete(created.id);
    segmentIds.splice(segmentIds.indexOf(created.id), 1);
  });

  test.skipIf(!hasSecretKey())("compute tracked dynamic segment", async () => {
    const client = new PlunkClient(secretKey!);
    const created = await client.segments.create({
      name: `sdk-tracked-${Date.now()}`,
      type: "DYNAMIC",
      trackMembership: true,
      condition: {
        logic: "AND",
        groups: [
          {
            filters: [{ field: "subscribed", operator: "equals", value: true }],
          },
        ],
      },
    });
    segmentIds.push(created.id);

    const computed = await client.segments.compute(created.id);
    expect(computed.total).toBeNumber();
    expect(computed.added).toBeNumber();
    expect(computed.removed).toBeNumber();

    await client.segments.delete(created.id);
    segmentIds.splice(segmentIds.indexOf(created.id), 1);
  });
});
