import { describe, it, expect } from "vitest";
import { decodeJwt } from "@/lib/dev/jwt";

// The well-known jwt.io example token: header {alg:HS256,typ:JWT},
// payload {sub:"1234567890",name:"John Doe",iat:1516239022}.
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("decodeJwt", () => {
  it("decodes a well-formed JWT's header and payload", () => {
    const result = decodeJwt(SAMPLE_JWT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(result.value.payload).toEqual({ sub: "1234567890", name: "John Doe", iat: 1516239022 });
    expect(result.value.signature).toBe("SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  });

  it("rejects a token without 3 parts", () => {
    const result = decodeJwt("not.a.valid.jwt.token");
    expect(result.ok).toBe(false);
  });

  it("rejects a token missing parts entirely", () => {
    const result = decodeJwt("justastring");
    expect(result.ok).toBe(false);
  });

  it("rejects a token whose segments aren't valid base64url JSON", () => {
    const result = decodeJwt("not-json.not-json.sig");
    expect(result.ok).toBe(false);
  });

  it("handles surrounding whitespace", () => {
    const result = decodeJwt(`  ${SAMPLE_JWT}  `);
    expect(result.ok).toBe(true);
  });
});
