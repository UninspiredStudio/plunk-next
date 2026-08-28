import { describe, expect, test } from "bun:test";
import { PlunkClient } from "../src/index.ts";
import { hasSecretKey, hasTestFrom, secretKey, testEmail, testFrom } from "./setup.ts";

describe("send", () => {
  test.skipIf(!hasSecretKey() || !hasTestFrom())("PlunkClient.send", async () => {
    const client = new PlunkClient(secretKey!);
    const result = await client.send({
      to: testEmail,
      from: testFrom!,
      subject: "Plunk SDK send test",
      body: "<p>Sent from plunk-next-client integration tests.</p>",
    });

    expect(result.emails.length).toBeGreaterThan(0);
    expect(result.emails[0]?.contact.id).toBeString();
    expect(result.emails[0]?.email).toBeString();
    expect(result.timestamp).toBeString();
  });
});
