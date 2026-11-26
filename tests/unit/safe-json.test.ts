import { describe, expect, it } from "vitest";
import { describeHttpFailure, readJsonSafely } from "@/lib/http/safe-json";

describe("Safe HTTP JSON Helpers (Serverless Resilience)", () => {
  it("returns null instead of throwing Unexpected end of JSON input on empty response body", async () => {
    const emptyRes = new Response("", { status: 504 });
    const parsed = await readJsonSafely<{ error?: string }>(emptyRes);
    expect(parsed).toBeNull();
  });

  it("returns null on HTML/plain-text gateway error pages (e.g. Vercel 413 / 504)", async () => {
    const htmlRes = new Response("Request Entity Too Large", { status: 413 });
    const parsed = await readJsonSafely<{ error?: string }>(htmlRes);
    expect(parsed).toBeNull();
  });

  it("parses valid JSON responses accurately", async () => {
    const okRes = new Response(JSON.stringify({ success: true, total: 5 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    const parsed = await readJsonSafely<{ success: boolean; total: number }>(okRes);
    expect(parsed).toEqual({ success: true, total: 5 });
  });

  it("maps HTTP 413, 504, and 429 statuses to clear Indonesian user guidance", () => {
    expect(describeHttpFailure(413, "pemindaian OCR")).toContain("terlalu besar");
    expect(describeHttpFailure(504, "pemindaian OCR")).toContain("batas waktu");
    expect(describeHttpFailure(429, "pemindaian OCR")).toContain("1 menit");
  });
});
