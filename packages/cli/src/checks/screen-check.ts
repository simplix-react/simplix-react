/*
 * Judges a generated screen's files against what SimpliX Meta states for its entity: the form carries
 * and marks what the create body requires, long text follows its length, and every name path a
 * reference draws is the one the referenced entity declares. Each of these compiles, lints and
 * renders, and is wrong only on the screen (a UUID drawn as a name, a first save the server refuses),
 * so it is read from the files and the Meta rather than found in a browser.
 */

/** The longest a single-line text may allow before the contract calls it long text. */
export const LONG_TEXT_MIN_LENGTH = 500;

/** What SimpliX Meta settles for one reference on an entity: the nested record and the path that names it. */
export interface ReferenceFact {
  /** The key field (`userId`). */
  readonly key: string;
  /** The nested record's field (`user`), the first segment of the name path. */
  readonly nested: string;
  /** The name path the screen must draw (`user.username`). */
  readonly path: string;
  /** `declared` when Meta states the name field, `inferred` when it was guessed from field names. */
  readonly source: "declared" | "inferred";
}

/** The facts a screen's files are judged against. */
export interface ScreenFacts {
  /** The fields the create body requires and a form can carry, less the order a list's drag owns. */
  readonly createRequired: readonly string[];
  /** The fields the create body requires that no generated control draws (a list of records, a nested record). */
  readonly createStructured: readonly string[];
  /** Fields of the list row that hold another record's key (`...Id`), that the create body requires, and that Meta declares no reference for. */
  readonly bareKeys: readonly string[];
  /** Field → the longest value the contract allows, where it states one. */
  readonly maxLengths: Readonly<Record<string, number>>;
  /** Field → whether it is a boolean, which a switch always holds a value for. */
  readonly booleans: ReadonlySet<string>;
  readonly references: readonly ReferenceFact[];
  /** Every field the list and detail rows carry, for a flat name field. */
  readonly rowFields: ReadonlySet<string>;
}

/** One finding. An error fails the check; a warning is printed. */
export interface ScreenProblem {
  readonly file: string;
  readonly severity: "error" | "warning";
  readonly message: string;
}

/** One line of a form's field table. */
export interface FormEntry {
  readonly name: string;
  readonly kind: string;
  readonly required: boolean;
  /** For a multilingual entry: the plain field the request carries the base language's text in. */
  readonly plainField?: string;
}

const FIELD_TABLE = /FormFields\b[^=\n]*=\s*\[([\s\S]*?)\n\];/;
const ENTRY = /\{\s*name:\s*"([^"]+)"\s*,\s*kind:\s*"([^"]+)"([^\n]*?)\}\s*,?\s*$/;

/** The field table of a form file: one entry per `{ name, kind, ... }` line. */
export function formEntriesOf(text: string): FormEntry[] {
  const table = FIELD_TABLE.exec(text)?.[1];
  if (table === undefined) return [];
  const out: FormEntry[] = [];
  for (const line of table.split("\n")) {
    const match = ENTRY.exec(line.trim());
    if (!match) continue;
    const rest = match[3] ?? "";
    const plain = /\bplainField:\s*"([^"]+)"/.exec(rest)?.[1];
    out.push({ name: match[1]!, kind: match[2]!, required: /\brequired:\s*true\b/.test(rest), ...(plain ? { plainField: plain } : {}) });
  }
  return out;
}

/** What a form's field table must hold for the create body, and how it must draw it. */
export function formProblems(file: string, text: string, facts: ScreenFacts): ScreenProblem[] {
  const problems: ScreenProblem[] = [];
  const error = (message: string) => problems.push({ file, severity: "error", message });
  // A required list of records or nested record has no generated control, so the form writes it by hand
  // and the file names it where it builds the request; a file that never names it cannot send it.
  for (const name of facts.createStructured) {
    if (!new RegExp(`\\b${name}\\b`).test(text)) {
      error(
        `the create body requires "${name}", a list or nested record that no generated control draws, and the form never names it, so the server refuses every save; build it in the form's submit`,
      );
    }
  }
  const entries = formEntriesOf(text);
  if (entries.length === 0) return problems;
  for (const name of facts.createRequired) {
    const entry = entries.find((one) => one.name === name);
    // A multilingual entry carries the plain field it fills, and is marked on its own field.
    if (!entry && entries.some((one) => one.plainField === name)) continue;
    if (!entry) {
      error(`the create body requires "${name}" and the form's field table has no entry for it, so an unedited form cannot create a record`);
    } else if (!entry.required && !facts.booleans.has(name)) {
      error(`"${name}" is required by the create body and its entry lacks \`required: true\``);
    }
  }
  for (const entry of entries) {
    const length = facts.maxLengths[entry.name];
    if (entry.kind === "text" && length !== undefined && length >= LONG_TEXT_MIN_LENGTH) {
      error(`"${entry.name}" allows ${length} characters and is drawn as single-line text; its kind is longText from ${LONG_TEXT_MIN_LENGTH}`);
    }
  }
  if (entries.some((one) => one.kind === "reference") && !/\bsearches\s*:/.test(text)) {
    error(
      "the form edits a reference and passes the contract no `searches`, so the key is typed as text; " +
        "name the picker for that entity in `scaffold.referencePickers` and regenerate, or pass the search",
    );
  }
  return problems;
}

/**
 * A list row field that holds another record's key (`userAccountId`) and has no reference Meta declares:
 * the scaffold draws no name for it, so the list shows no column for it (or shows the key as text).
 * A column is a `key:` or `name:` entry of the file; a filter alone (`field:`) does not draw the value.
 */
export function listProblems(file: string, text: string, facts: ScreenFacts): ScreenProblem[] {
  const problems: ScreenProblem[] = [];
  for (const name of facts.bareKeys) {
    if (new RegExp(`\\b(?:key|name):\\s*"${name}"`).test(text)) continue;
    problems.push({
      file,
      severity: "warning",
      message: `the list row carries "${name}", another record's key, and Meta declares no reference (nested record and name field) for it, so the list draws no column for it; raise the reference in the backend, or draw its name through a lookup`,
    });
  }
  return problems;
}

const NAME_FIELD = /nameField:\s*"([^"]+)"/g;

/** Every name path a file draws a reference by. */
export function nameFieldsIn(text: string): string[] {
  return [...text.matchAll(NAME_FIELD)].map((match) => match[1]!);
}

/** A name path the reference does not settle on, or one that draws nothing. */
export function nameFieldProblems(file: string, text: string, facts: ScreenFacts): ScreenProblem[] {
  const problems: ScreenProblem[] = [];
  const reported = new Set<string>();
  for (const path of nameFieldsIn(text)) {
    if (reported.has(path)) continue;
    reported.add(path);
    const [head] = path.split(".");
    if (!path.includes(".")) {
      if (!facts.rowFields.has(path)) {
        problems.push({ file, severity: "error", message: `name field "${path}" is not a field of the record the screen reads` });
      }
      continue;
    }
    const reference = facts.references.find((one) => one.nested === head);
    if (!reference) {
      problems.push({ file, severity: "error", message: `name path "${path}" names a nested record "${head}" that no reference of this entity carries` });
    } else if (reference.path !== path) {
      problems.push({
        file,
        severity: "error",
        message: `name path "${path}" is not the name Meta settles for "${reference.key}" ("${reference.path}"); the nested record lists every property of the entity and the serializer may write out fewer, so a path that merely resolves can draw the key`,
      });
    } else if (reference.source === "inferred") {
      problems.push({
        file,
        severity: "warning",
        message: `name path "${path}" was guessed from field names: the referenced entity declares no name fields. Declare \`nameFields\` on it (or \`reference.nameField\` on "${reference.key}") in the backend`,
      });
    }
  }
  return problems;
}

/** A frame's sample row that spells a nested name path as one flat key, which no reader of the contract resolves. */
export function flatKeyProblems(file: string, text: string, facts: ScreenFacts): ScreenProblem[] {
  const problems: ScreenProblem[] = [];
  for (const reference of facts.references) {
    if (text.includes(`"${reference.path}":`)) {
      problems.push({
        file,
        severity: "error",
        message: `a sample row spells "${reference.path}" as one flat key; write the nested record (\`${reference.nested}: { ... }\`)`,
      });
    }
  }
  return problems;
}
