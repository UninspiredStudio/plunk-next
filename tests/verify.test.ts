import { describe, expect, test } from "bun:test";
import { PlunkClient } from "../src/index.ts";
import { hasSecretKey, secretKey } from "./setup.ts";

describe("verify", () => {
  test.skipIf(!hasSecretKey())("PlunkClient.verify", async () => {
    const client = new PlunkClient(secretKey!);
    const result = await client.verify({ email: "user@gmail.com" });

    expect(result.email).toBe("user@gmail.com");
    expect(result.valid).toBeBoolean();
    expect(result.isDisposable).toBeBoolean();
    expect(result.isAlias).toBeBoolean();
    expect(result.isTypo).toBeBoolean();
    expect(result.isPlusAddressed).toBeBoolean();
    expect(result.isPersonalEmail).toBeBoolean();
    expect(result.domainExists).toBeBoolean();
    expect(result.hasWebsite).toBeBoolean();
    expect(result.hasMxRecords).toBeBoolean();
    expect(result.reasons).toBeArray();
  });
});
