import { describe, expect, test } from "bun:test";
import { PlunkPublicClient } from "../src/index.ts";
import { hasPublicKey, publicKey, testEmail } from "./setup.ts";

describe("track", () => {
  test.skipIf(!hasPublicKey())("PlunkPublicClient.track", async () => {
    const client = new PlunkPublicClient(publicKey!);
    const result = await client.track({
      email: testEmail,
      event: "sdk_public_track_test",
      data: { source: "plunk-next-client" },
    });

    expect(result.contact).toBeString();
    expect(result.event).toBeString();
    expect(result.timestamp).toBeString();
  });
});
