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
        if (body.get("grant_type") === "authorization_code" && body.get("code") === "used") {
          return json({ error: "invalid_grant", error_description: "Code not valid" }, 400);
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
    // The pending sign-in is forgotten; only the ID token sign-out will name is left.
    expect(storage.getItem("simplix:oidc:pending")).toBeNull();
    expect(storage.getItem("simplix:oidc:pending:id-token")).toBe("id");
    expect(storage.size()).toBe(1);
  });

  it("refuses a response whose state is not the pending one, and forgets the pending sign-in", async () => {
    const { oidc } = await signedOut();
    await expect(oidc.completeSignIn("https://app.example.test/login/complete?code=abc&state=forged"))
      .rejects.toMatchObject({ code: "SIGN_IN_FAILED" });
    expect(storage.size()).toBe(0);
  });

  it("refuses a response with no sign-in pending, and says the response belongs to no sign-in started here", async () => {
    const refused = client().completeSignIn("https://app.example.test/login/complete?code=abc&state=s");
    await expect(refused).rejects.toBeInstanceOf(AuthError);
    await expect(refused).rejects.toMatchObject({ code: "SIGN_IN_FAILED", signInFailure: "not-pending", issuerError: undefined });
  });

  it("names a response for another sign-in's state as not pending here, as it names no pending at all", async () => {
    const { oidc } = await signedOut();
    await expect(oidc.completeSignIn("https://app.example.test/login/complete?code=abc&state=forged"))
      .rejects.toMatchObject({ signInFailure: "not-pending" });
  });

  it("names a response that answers the pending sign-in without a code as malformed", async () => {
    const { oidc, authorize } = await signedOut();
    await expect(oidc.completeSignIn(`https://app.example.test/login/complete?state=${authorize.searchParams.get("state")}`))
      .rejects.toMatchObject({ signInFailure: "malformed-response" });
  });

  it("reports the issuer's error with its description, before any pending state is looked at", async () => {
    const { oidc } = await signedOut();
    const refused = oidc.completeSignIn(
      "https://app.example.test/login/complete?error=temporarily_unavailable&error_description=authentication_expired&state=s",
    );
    await expect(refused).rejects.toThrow("temporarily_unavailable");
    await expect(refused).rejects.toMatchObject({
      signInFailure: "issuer-error",
      issuerError: { error: "temporarily_unavailable", description: "authentication_expired" },
    });
    await expect(client().completeSignIn("https://app.example.test/login/complete?error=access_denied"))
      .rejects.toMatchObject({ signInFailure: "issuer-error", issuerError: { error: "access_denied", description: undefined } });
  });

  it("names a refused code exchange, keeping the issuer's words", async () => {
    const { oidc, authorize } = await signedOut();
    await expect(oidc.completeSignIn(`https://app.example.test/login/complete?code=used&state=${authorize.searchParams.get("state")}`))
      .rejects.toMatchObject({ code: "SIGN_IN_FAILED", signInFailure: "token-refused", issuerError: { error: "invalid_grant", description: "Code not valid" } });
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

  it("names the ID token of the sign-in at sign-out, once, with no caller keeping it", async () => {
    const { oidc, authorize } = await signedOut();
    await oidc.completeSignIn(`https://app.example.test/login/complete?code=abc&state=${authorize.searchParams.get("state")}`);

    const first = new URL((await oidc.signOutUrl())!);
    expect(first.searchParams.get("id_token_hint")).toBe("id");
    const second = new URL((await oidc.signOutUrl())!);
    expect(second.searchParams.has("id_token_hint")).toBe(false);
    expect(storage.size()).toBe(0);
  });

  it("keeps the newest ID token a refresh hands back, and keeps the last one when a refresh is refused", async () => {
    fetchFn.mockImplementationOnce(async () => json(DISCOVERY));
    const oidc = client();
    fetchFn.mockImplementationOnce(async () => json({ access_token: "a2", refresh_token: "r2", id_token: "id-2", expires_in: 300 }));
    await oidc.refresh("refresh");
    await expect(oidc.refresh("dead")).rejects.toMatchObject({ code: "REFRESH_FAILED" });
    // A refused refresh is what clears the token store, and sign-out still ends the session.
    const url = new URL((await oidc.signOutUrl())!);
    expect(url.searchParams.get("id_token_hint")).toBe("id-2");
  });

  it("an ID token passed in wins over the kept one and leaves it kept", async () => {
    storage.setItem("simplix:oidc:pending:id-token", "kept");
    const url = new URL((await client().signOutUrl("passed"))!);
    expect(url.searchParams.get("id_token_hint")).toBe("passed");
    expect(storage.getItem("simplix:oidc:pending:id-token")).toBe("kept");
  });

  it("names the ID token at a sign-out from another tab when the tabs share where it is kept", async () => {
    const shared = memoryStorage();
    const tab = (own: ReturnType<typeof memoryStorage>) =>
      createOidcClient({ issuer: ISSUER, clientId: "backoffice", redirectUri: "https://app.example.test/login/complete", storage: own, idTokenStorage: shared, fetchFn, navigate: () => undefined });
    const first = memoryStorage();
    const second = memoryStorage();
    await tab(first).refresh("refresh");
    // The sign-in tab's pending state stays its own; the ID token reaches the other tab.
    expect(first.getItem("simplix:oidc:pending:id-token")).toBeNull();
    const url = new URL((await tab(second).signOutUrl())!);
    expect(url.searchParams.get("id_token_hint")).toBe("id");
    expect(shared.size()).toBe(0);
  });

  it("keeps the ID token beside the pending sign-in when no shared storage is named", async () => {
    const other = memoryStorage();
    await client().refresh("refresh");
    const fromOtherTab = createOidcClient({ issuer: ISSUER, clientId: "backoffice", redirectUri: "https://app.example.test/login/complete", storage: other, fetchFn });
    expect(new URL((await fromOtherTab.signOutUrl())!).searchParams.has("id_token_hint")).toBe(false);
    expect(storage.getItem("simplix:oidc:pending:id-token")).toBe("id");
  });

  it("keeps the ID token under its own storage key", async () => {
    const own = createOidcClient({ issuer: ISSUER, clientId: "portal", redirectUri: "https://app.example.test/c", storage, storageKey: "portal:oidc", fetchFn });
    await own.refresh("refresh");
    expect(storage.getItem("portal:oidc:id-token")).toBe("id");
  });

  it("signs in and out where the browser refuses storage, only without the ID token", async () => {
    const refusing = {
      getItem: () => null,
      setItem: (key: string) => {
        if (key.endsWith(":id-token")) throw new DOMException("blocked", "SecurityError");
      },
      removeItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    };
    const oidc = createOidcClient({ issuer: ISSUER, clientId: "backoffice", redirectUri: "https://app.example.test/c", storage: refusing, fetchFn });
    await expect(oidc.refresh("refresh")).resolves.toMatchObject({ idToken: "id" });
    const url = new URL((await oidc.signOutUrl())!);
    expect(url.searchParams.has("id_token_hint")).toBe(false);
  });

  it("reads the discovery document once", async () => {
    const oidc = client();
    await oidc.discovery();
    await oidc.discovery();
    expect(fetchFn.mock.calls.filter(([url]) => String(url).includes("openid-configuration"))).toHaveLength(1);
  });
});
