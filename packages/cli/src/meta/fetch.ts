import { readFile, writeFile } from "node:fs/promises";
import type { DtoMeta } from "./ir-types.js";

/** The IR version this CLI understands. A newer document is refused rather than read partially. */
export const SUPPORTED_IR_VERSION = 1;

export interface FetchMetaOptions {
  /** Endpoint URL, or a path to a committed snapshot. */
  source: string;
  /** When set, a fetched IR is written here so a later run can work offline. */
  snapshot?: string;
  /** Read `snapshot` instead of `source`. */
  offline?: boolean;
}

export async function fetchMeta(options: FetchMetaOptions): Promise<DtoMeta> {
  const raw = options.offline
    ? await readSnapshot(options)
    : await readSource(options.source);
  const meta = unwrap(raw);
  assertVersion(meta);
  if (options.snapshot && !options.offline) {
    await writeFile(options.snapshot, JSON.stringify(meta, null, 2), "utf-8");
  }
  return meta;
}

/**
 * Where a payload came from. This decides how the SimpliX envelope is handled: an HTTP response
 * always carries one, a file on disk may hold either the whole response or the bare document.
 */
type PayloadOrigin = "http" | "file";

/** A parsed JSON payload together with what is known about where it came from. */
interface RawPayload {
  origin: PayloadOrigin;
  /** URL or file path, used to name the document in an error. */
  location: string;
  value: unknown;
}

function isHttpSource(source: string): boolean {
  return /^https?:\/\//i.test(source);
}

async function readSource(source: string): Promise<RawPayload> {
  if (!isHttpSource(source)) {
    return { origin: "file", location: source, value: await readJsonFile(source) };
  }

  const response = await fetch(source);
  if (!response.ok) {
    // The backend answers a duplicate DTO simple name with a 409 whose body names both Java
    // classes. Dropping that body leaves the operator with a status code and nothing to act on.
    const detail = await readResponseText(response);
    throw new Error(
      `DTO meta request to ${source} failed with ${describeStatus(response)}` +
        (detail ? `: ${detail}` : ""),
    );
  }
  return { origin: "http", location: source, value: parseJson(await response.text(), source) };
}

async function readSnapshot(options: FetchMetaOptions): Promise<RawPayload> {
  if (!options.snapshot) {
    throw new Error(
      "Offline mode needs a saved DTO meta snapshot: pass a `snapshot` path alongside `offline`.",
    );
  }
  return {
    origin: "file",
    location: options.snapshot,
    value: await readJsonFile(options.snapshot),
  };
}

/**
 * Take the IR out of whatever the source handed over, judging by what that source guarantees
 * rather than by the payload's shape.
 *
 * An HTTP source always carries the SimpliX envelope, because the endpoint returns
 * `SimpliXApiResponse<DtoMeta>` — so `body` is taken without asking. A file may hold either the
 * whole response or the bare document, and `version` settles which: it is an unboxed Java `int`,
 * so `@JsonInclude(NON_NULL)` never drops it and a bare IR always carries it at the top level.
 */
function unwrap(raw: RawPayload): DtoMeta {
  if (raw.origin === "file" && isIrDocument(raw.value)) {
    return raw.value;
  }

  if (!isRecord(raw.value)) {
    throw new Error(
      `DTO meta document at ${raw.location} is not a JSON object (got ${describeValue(raw.value)}).`,
    );
  }

  const body = raw.value["body"];
  if (body === undefined || body === null) {
    throw new Error(errorEnvelopeMessage(raw));
  }
  if (!isIrDocument(body)) {
    throw new Error(
      `The response envelope at ${raw.location} carries no DTO meta IR: its \`body\` has no numeric \`version\`.`,
    );
  }
  return body;
}

function errorEnvelopeMessage(raw: RawPayload): string {
  if (raw.origin === "file") {
    return (
      `The snapshot at ${raw.location} is neither a DTO meta IR (no \`version\`) ` +
      `nor a response envelope (no \`body\`).`
    );
  }
  const envelope = isRecord(raw.value) ? raw.value : {};
  return (
    `The DTO meta endpoint at ${raw.location} returned an error envelope rather than an IR: ` +
    `type=${describeValue(envelope["type"])}, message=${describeValue(envelope["message"])}`
  );
}

function assertVersion(meta: DtoMeta): void {
  if (meta.version > SUPPORTED_IR_VERSION) {
    throw new Error(
      `DTO meta IR version ${meta.version} is newer than this CLI understands ` +
        `(supported: ${SUPPORTED_IR_VERSION}). Upgrade @simplix-react/cli to read it — ` +
        `generating from it now would silently drop whatever the newer version added.`,
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * `version` is the IR's only guaranteed top-level member, and the envelope has no member of that
 * name, so its presence is what separates the two payload shapes on disk. Nothing else about the
 * document is inspected here — a malformed IR is the generator's problem to report, not this one's.
 */
function isIrDocument(value: unknown): value is DtoMeta {
  return isRecord(value) && typeof value["version"] === "number";
}

function describeStatus(response: Response): string {
  return response.statusText ? `${response.status} ${response.statusText}` : `${response.status}`;
}

async function readResponseText(response: Response): Promise<string> {
  try {
    return (await response.text()).trim();
  } catch {
    // A body that cannot be read must not replace the status as the reported failure.
    return "";
  }
}

async function readJsonFile(path: string): Promise<unknown> {
  let text: string;
  try {
    text = await readFile(path, "utf-8");
  } catch (cause) {
    throw new Error(`Cannot read DTO meta document at ${path}: ${describeError(cause)}`, { cause });
  }
  return parseJson(text, path);
}

function parseJson(text: string, location: string): unknown {
  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new Error(
      `DTO meta document at ${location} is not valid JSON: ${describeError(cause)}`,
      { cause },
    );
  }
}

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function describeValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return "an array";
  return String(value);
}
