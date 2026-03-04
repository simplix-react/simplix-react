import { z } from "zod";

// Login input schema
export const loginInputSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Auth token schemas
export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessTokenExpiry: z.string(),
  refreshTokenExpiry: z.string(),
});

// User profile schemas
// Spring Security returns roles as either string ("ROLE_ADMIN") or object ({ roleCode, roleName })
export const roleSchema = z.union([
  z.string(),
  z.object({
    roleCode: z.string(),
    roleName: z.string(),
  }),
]);

export const userProfileSchema = z.object({
  userId: z.string(),
  username: z.string(),
  displayName: z.string(),
  email: z.string(),
  roles: z.array(roleSchema),
  isSuperAdmin: z.boolean(),
});

// Permissions schemas
export const permissionsSchema = z.object({
  permissions: z.record(z.string(), z.array(z.string())),
  roles: z.array(roleSchema),
  isSuperAdmin: z.boolean(),
});
