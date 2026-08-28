export const secretKey = process.env.PLUNK_SECRET_KEY;
export const publicKey = process.env.PLUNK_PUBLIC_KEY;
export const testEmail =
  process.env.PLUNK_TEST_EMAIL ?? `plunk-test-${Date.now()}@example.com`;
export const testFrom = process.env.PLUNK_TEST_FROM;

export function hasSecretKey(): boolean {
  return Boolean(secretKey);
}

export function hasPublicKey(): boolean {
  return Boolean(publicKey);
}

export function hasTestFrom(): boolean {
  return Boolean(testFrom);
}
