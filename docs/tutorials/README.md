# Tutorials

Step-by-step tutorials that walk through building complete applications from scratch. Each tutorial starts from zero and builds up to a fully working result, introducing concepts progressively along the way.

## Contents

| Document | Description |
| --- | --- |
| [Petstore OpenAPI](./petstore-openapi.md) | Generate a fully typed, multi-domain monorepo from the Swagger Petstore OpenAPI spec — scaffold the project with `simplix init`, import the spec with `simplix openapi`, and get Zod schemas, React Query hooks, and MSW mock handlers derived automatically |
| [Project Management App](./project-app.md) | Build a project management app from scratch: define project and task entity contracts with Zod schemas, derive React Query hooks, create list and detail views, and wire up create/update mutations with automatic cache invalidation |
| [Auth Protected App](./auth-protected-app.md) | Add authentication to an existing app: configure `createAuth` with Bearer token scheme, set up automatic token refresh and 401 retry, protect routes with `AuthProvider`, and implement login/logout flows with `useAuth` |
| [Full-Stack Mock](./full-stack-mock.md) | Build a complete frontend application backed by an in-memory mock store and MSW service worker — no backend required. Set up `deriveMockHandlers`, seed initial data, and develop against a realistic API simulation with full CRUD support |
