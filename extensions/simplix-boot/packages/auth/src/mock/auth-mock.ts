import { http, HttpResponse } from "msw";
import type { MockDomainConfig } from "@simplix-react/mock";
import { wrapEnvelope } from "../envelope.js";

export interface MockUserProfile {
  user: {
    userId: string;
    username: string;
    displayName: string;
    email: string;
    roles: { roleCode: string; roleName: string }[];
    isSuperAdmin: boolean;
  };
  permissions: {
    permissions: Record<string, string[]>;
    roles: { roleCode: string; roleName: string }[];
    isSuperAdmin: boolean;
  };
  password: string;
}

export interface AuthMockOptions {
  basePath?: string;
  users: Record<string, MockUserProfile>;
}

function makeTokenResponse(username: string) {
  const now = new Date();
  const accessExpiry = new Date(now.getTime() + 30 * 60 * 1000);
  const refreshExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    accessToken: `mock-access-${username}-${Date.now()}`,
    refreshToken: `mock-refresh-${username}-${Date.now()}`,
    accessTokenExpiry: accessExpiry.toISOString(),
    refreshTokenExpiry: refreshExpiry.toISOString(),
  };
}

function extractUsername(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer mock-access-")) return null;
  const parts = auth.replace("Bearer mock-access-", "").split("-");
  return parts[0];
}

export function createAuthMock(options: AuthMockOptions): MockDomainConfig {
  const { basePath = "/api/v1", users } = options;

  const handlers = [
    http.get(`${basePath}/auth/token/issue`, async ({ request }) => {
      const auth = request.headers.get("Authorization");
      if (!auth || !auth.startsWith("Basic ")) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const decoded = atob(auth.replace("Basic ", ""));
      const [username, password] = decoded.split(":");
      const profile = users[username];
      if (profile && profile.password === password) {
        return HttpResponse.json(makeTokenResponse(username));
      }
      return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }),

    http.get(`${basePath}/auth/token/refresh`, ({ request }) => {
      const username = extractUsername(request) ?? "admin";
      return HttpResponse.json(makeTokenResponse(username));
    }),

    http.post(`${basePath}/auth/token/revoke`, () => {
      return new HttpResponse(null, { status: 204 });
    }),

    http.get(`${basePath}/user/me`, ({ request }) => {
      const username = extractUsername(request);
      if (!username) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const profile = users[username];
      if (!profile) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return HttpResponse.json(wrapEnvelope(profile.user));
    }),

    http.get(`${basePath}/user/me/permissions`, ({ request }) => {
      const username = extractUsername(request);
      if (!username) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const profile = users[username];
      if (!profile) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return HttpResponse.json(wrapEnvelope(profile.permissions));
    }),

    http.get(`${basePath}/public/user/permissions`, () => {
      return HttpResponse.json(wrapEnvelope({
        permissions: {},
        roles: [],
        isSuperAdmin: false,
      }));
    }),
  ];

  return {
    name: "auth",
    handlers,
  };
}
