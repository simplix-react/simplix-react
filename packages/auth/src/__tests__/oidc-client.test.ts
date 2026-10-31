import { describe, it, expect, vi, beforeEach } from "vitest";
import { createOidcClient } from "../helpers/oidc-client.js";
import { AuthError } from "../errors.js";

const ISSUER = "https://id.example.test/realms/staff";
const DISCOVERY = {
  authorization_endpoint: `${ISSUER}/protocol/openid-connect/auth`,
  token_endpoint: `${ISSUER}/protocol/openid-connect/token`,
  end_session_endpoint: `${ISSUER}/protocol/openid-connect/logout`,
};

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    size: () => map.size,
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("createOidcClient", () => {
  const fetchFn = vi.fn<typeof fetch>();
  let storage: ReturnType<typeof memoryStorage>;
  let navigated: string | null;

  beforeEach(() => {
    fetchFn.mockReset();
    storage = memoryStorage();
    navigated = null;
    fetchFn.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith("/.well-known/openid-configuration")) return json(DISCOVERY);
      if (url === DISCOVERY.token_endpoint) {
        const body = new URLSearchParams(String(init?.body));
        if (body.get("grant_type") === "refresh_token" && body.get("refresh_token") === "dead") {
          return json({ error: "invalid_grant" }, 400);
        }
        if (body.get("grant_type") === "refresh_token" && body.get("refresh_token") === "disabled") {
          return json({ error: "invalid_grant", error_description: "User disabled" }, 400);
        }
        if (body.get("grant_type") === "refresh_token" && body.get("refresh_token") === "html") {
          return new Response("<html>bad gateway</html>", { status: 502 });
        }
        return json({ access_token: "access", refresh_token: "refresh", id_token: "id", expires_in: 300 });
      }
      return json({}, 404);
    });
  });

  function client() {
    return createOidcClient({
      issuer: `${ISSUER}/`,
      clientId: "backoffice",
      redirectUri: "https://app.example.test/login/complete",
      postLogoutRedirectUri: "https://app.example.test/login",
      scopes: ["openid", "email"],
      storage,
      fetchFn,
      navigate: (url) => {
        navigated = url;
      },
    });
  }

  async function signedOut() {
    const oidc = client();
    await oidc.signIn({ returnTo: "/users", params: { ui_locales: "ko" } });
    return { oidc, authorize: new URL(navigated!) };
  }

  it("sends the browser to the issuer with an S256 challenge of the stored verifier", async () => {
    const { authorize } = await signedOut();
    const pending = JSON.parse(storage.getItem("simplix:oidc:pending")!);

    expect(authorize.origin + authorize.pathname).toBe(DISCOVERY.authorization_endpoint);
    expect(authorize.searchParams.get("response_type")).toBe("code");
    expect(authorize.searchParams.get("scope")).toBe("openid email");
    expect(authorize.searchParams.get("ui_locales")).toBe("ko");
    expect(authorize.searchParams.get("state")).toBe(pending.state);
    expect(authorize.searchParams.get("code_challenge_method")).toBe("S256");
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pending.verifier)));
    const expected = btoa(String.fromCharCode(...digest)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(authorize.searchParams.get("code_challenge")).toBe(expected);
  });

  it("exchanges the code with the verifier and hands back where the sign-in started", async () => {
    const { oidc, authorize } = await signedOut();
    const pending = JSON.parse(storage.getItem("simplix:oidc:pending")!);
    const callback = `https://app.example.test/login/complete?code=abc&state=${authorize.searchParams.get("state")}`;

    const { tokens, returnTo } = await oidc.completeSignIn(callback);

    expect(tokens).toMatchObject({ accessToken: "access", refreshToken: "refresh", idToken: "id", expiresIn: 300 });
    expect(returnTo).toBe("/users");
    const sent = new URLSearchParams(String(fetchFn.mock.calls.at(-1)![1]!.body));
    expect(sent.get("code")).toBe("abc");
    expect(sent.get("code_verifier")).toBe(pending.verifier);
    expect(storage.size()).toBe(0);
  });

  it("refuses a response whose state is not the pending one, and forgets the pending sign-in", async () => {
    const { oidc } = await signedOut();
    await expect(oidc.completeSignIn("https://app.example.test/login/complete?code=abc&state=forged"))
      .rejects.toMatchObject({ code: "SIGN_IN_FAILED" });
    expect(storage.size()).toBe(0);
  });

  it("refuses a response with no sign-in pending", async () => {
    await expect(client().completeSignIn("https://app.example.test/login/complete?code=abc&state=s"))
      .rejects.toBeInstanceOf(AuthError);
  });

  it("reports the issuer's error", async () => {
    const { oidc } = await signedOut();
    await expect(oidc.completeSignIn("https://app.example.test/login/complete?error=access_denied"))
      .rejects.toThrow("access_denied");
  });

  it("refreshes, and reports a refused refresh as REFRESH_FAILED", async () => {
    const oidc = client();
    await expect(oidc.refresh("good")).resolves.toMatchObject({ accessToken: "access" });
    await expect(oidc.refresh("dead")).rejects.toMatchObject({ code: "REFRESH_FAILED" });
  });

  it("keeps the issuer's error and description on a refused refresh", async () => {
    const oidc = client();
    await expect(oidc.refresh("disabled")).rejects.toMatchObject({
      code: "REFRESH_FAILED",
      issuerError: { error: "invalid_grant", description: "User disabled" },
    });
    await expect(oidc.refresh("dead")).rejects.toMatchObject({
      issuerError: { error: "invalid_grant", description: undefined },
    });
    // A refusal with no OAuth body, such as a proxy's error page, carries no issuer error.
    const proxied = await oidc.refresh("html").catch((error: unknown) => error);
    expect(proxied).toMatchObject({ code: "REFRESH_FAILED", issuerError: undefined });
  });

  it("builds the sign-out address with the ID token and the return address", async () => {
    const url = new URL((await client().signOutUrl("id"))!);
    expect(url.searchParams.get("id_token_hint")).toBe("id");
    expect(url.searchParams.get("post_logout_redirect_uri")).toBe("https://app.example.test/login");
  });

  it("reads the discovery document once", async () => {
    const oidc = client();
    await oidc.discovery();
    await oidc.discovery();
    expect(fetchFn.mock.calls.filter(([url]) => String(url).includes("openid-configuration"))).toHaveLength(1);
  });
});
