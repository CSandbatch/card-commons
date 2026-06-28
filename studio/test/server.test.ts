import { afterEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { createSession, signSession, validatePasscode, verifySession } from "@/lib/server/session";
import { imageProvider } from "@/lib/server/provider";
import { assetFromCandidate } from "@/lib/assets";
import { validateAssetMetadata } from "@/lib/validation";

describe("pilot session and provider boundary", () => {
  afterEach(() => {
    delete process.env.PILOT_ACCESS_HASH;
    delete process.env.SESSION_SIGNING_SECRET;
    delete process.env.STUDIO_MOCK_IMAGES;
  });

  it("uses constant-length hashes and rejects modified cookies", () => {
    process.env.PILOT_ACCESS_HASH = createHash("sha256").update("right-passcode").digest("hex");
    process.env.SESSION_SIGNING_SECRET = "test-secret";
    expect(validatePasscode("right-passcode")).toBe(true);
    expect(validatePasscode("wrong")).toBe(false);
    const token = signSession(createSession());
    expect(verifySession(token)?.remaining).toBe(20);
    expect(verifySession(`${token}x`)).toBeNull();
  });

  it("provides deterministic, credit-free generation in mock mode", async () => {
    process.env.STUDIO_MOCK_IMAGES = "true";
    const candidate = await imageProvider().generate({
      role: "emblem", prompt: "A moon flower",
      cardContext: { message: "Hello", signature: "Ada", templateId: "calling-card-nocturne-v1" },
    });
    expect(candidate.mimeType).toBe("image/svg+xml");
    expect(candidate.provenance.provider).toBe("mock");
    expect(candidate.encoded.length).toBeGreaterThan(100);
    expect(validateAssetMetadata(assetFromCandidate(candidate).metadata).valid).toBe(true);
  });
});
