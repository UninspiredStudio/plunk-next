import { afterAll, describe, expect, test } from "bun:test";
import { PlunkClient } from "../src/index.ts";
import { hasSecretKey, hasTestFrom, secretKey, testFrom } from "./setup.ts";

describe("templates", () => {
  const templateIds: string[] = [];

  afterAll(async () => {
    if (!hasSecretKey()) {
      return;
    }

    const client = new PlunkClient(secretKey!);
    for (const id of templateIds) {
      await client.templates.delete(id);
    }
  });

  test.skipIf(!hasSecretKey() || !hasTestFrom())("list", async () => {
    const client = new PlunkClient(secretKey!);
    const list = await client.templates.list({ page: 1, pageSize: 10 });

    expect(list.data).toBeArray();
    expect(list.total).toBeNumber();
    expect(list.page).toBeNumber();
    expect(list.pageSize).toBeNumber();
    expect(list.totalPages).toBeNumber();
  });

  test.skipIf(!hasSecretKey() || !hasTestFrom())(
    "create, get, update, duplicate, usage, delete",
    async () => {
      const client = new PlunkClient(secretKey!);
      const created = await client.templates.create({
        name: `sdk-template-${Date.now()}`,
        subject: "SDK template test",
        body: "<p>Hello {{email}}</p>",
        from: testFrom!,
      });
      templateIds.push(created.id);

      const fetched = await client.templates.get(created.id);
      expect(fetched.id).toBe(created.id);

      const updated = await client.templates.update(created.id, {
        subject: "Updated subject",
      });
      expect(updated.subject).toBe("Updated subject");

      const duplicated = await client.templates.duplicate(created.id);
      templateIds.push(duplicated.id);
      expect(duplicated.id).not.toBe(created.id);

      const usage = await client.templates.usage(created.id);
      expect(usage.workflowSteps).toBeNumber();
      expect(usage.emailsSent).toBeNumber();

      await client.templates.delete(created.id);
      templateIds.splice(templateIds.indexOf(created.id), 1);
      await client.templates.delete(duplicated.id);
      templateIds.splice(templateIds.indexOf(duplicated.id), 1);
    },
    60_000,
  );
});
