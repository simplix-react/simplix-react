import { useCallback, useState } from "react";

import {
  getValidationErrors,
  type ValidationFieldError,
} from "@simplix-react/api";
import type { CrudMutation } from "@simplix-react/headless";
import { applyI18nFallback } from "./i18n-submit-helper";

export type { CrudMutation } from "@simplix-react/headless";

/** Options for the {@link useCrudFormSubmit} hook. */
export interface UseCrudFormSubmitOptions<T, TId = unknown> {
  /** Entity ID for edit mode. When nullish, create mode is used. */
  entityId?: TId;
  /**
   * Create mutation hook result. Omit it on a form that only ever edits.
   *
   * @remarks
   * A form reached from a record — an edit panel, a settings pane — has no create path, and
   * demanding one here meant registering a mutation the screen never calls. That is what sent
   * those forms to a raw `mutateAsync` with a toast instead, which throws away the per-field
   * detail the server sends with a refusal. One of `create` and `update` has to be there for the
   * mode the form is in.
   */
  create?: CrudMutation<T>;
  /** Update mutation hook result. Required for edit mode. */
  update?: CrudMutation<{ id: TId; dto: T }>;
  /**
   * Map of i18n field name → plain field name. Before submit, each plain
   * field is populated from `applyI18nFallback(values[i18nField], locales)`.
   */
  i18nFields?: Record<string, string>;
  /**
   * Locale config order for fallback (typically `useLocalePicker().locales`).
   * Required when `i18nFields` is provided.
   */
  locales?: ReadonlyArray<{ value: string }>;
  /**
   * How the form's values become the DTO, declared rather than assembled by hand.
   *
   * @remarks
   * **A form that builds its own DTO in the submit handler is writing the field list twice.**
   * Across one console, 168 such assignments did four mechanical things and 73 of them did
   * nothing at all — `holidayName: values.holidayName`, a field copied across so that the object
   * literal would be complete. What that costs is not the typing: a key left out of the literal
   * is a value that silently never leaves the browser, and the request still answers 200. That is
   * how a translation map came to be dropped on ten screens at once.
   *
   * Every value passes through untouched unless named here, so the copies disappear and what
   * remains in the call is only what is actually being done to a field.
   */
  fields?: {
    /** Text fields whose surrounding space is not part of the value. */
    readonly trim?: readonly string[];
    /**
     * Fields where an empty box means「not given」rather than the empty string.
     *
     * Applied after `trim`, so a box holding only spaces is not given either.
     */
    readonly emptyToUndefined?: readonly string[];
    /** Form-only state — a picker's open tab, a confirmation checkbox — that is not a DTO field. */
    readonly omit?: readonly string[];
  };
  /**
   * The last word, for what the four shapes above cannot say.
   *
   * @remarks
   * Runs after every declared transform and after the i18n derivation, so it sees the DTO as it
   * would have been sent. Kept deliberately narrow: a form reaching for this to do a trim has
   * moved the field list back into its own body, which is what `fields` exists to end.
   */
  prepare?: (dto: T) => T;
  /**
   * Called after a successful create or update, with whatever the mutation answered.
   *
   * @remarks
   * A create form that navigates to the record it just made needs the new id, and the answer is
   * the only place it exists. The argument is `unknown` because create and update answer with
   * different shapes; narrow it the way the rest of the screen reads a response. Callers that do
   * not need it ignore it, as they always have.
   */
  onSuccess?: (result: unknown) => void;
  /**
   * Optional client-side validator. Runs on submit BEFORE the server
   * mutation. Receives the raw form values (pre-i18n-fallback) and must
   * return either `null` / `{}` to pass, or `Record<field, message>` to
   * block the submit.
   *
   * When the validator returns errors:
   *   - `fieldErrors` is set to the returned errors
   *   - the create/update mutation is NOT called
   *   - the form stays on screen
   *
   * Client and server errors are temporally mutually exclusive: a failing
   * validator prevents the network call, so server errors cannot coexist
   * with client errors in the same submit attempt. A subsequent submit
   * either replaces the errors with new client errors, new server errors,
   * or clears them on success.
   *
   * Wrap inline validator functions with `useCallback` / `useMemo` to keep
   * `handleSubmit` identity stable across renders.
   *
   * @example Zod (use `zodToFieldErrors` from `@simplix-react/form`):
   * ```ts
   * import { zodToFieldErrors } from "@simplix-react/form";
   * import { createUserSchema } from "@my-app/domain-user";
   *
   * validator: (v) => zodToFieldErrors(createUserSchema, v)
   * ```
   *
   * @example Custom rules:
   * ```ts
   * validator: (v) => v.email?.includes("@")
   *   ? null
   *   : { email: "Invalid email" }
   * ```
   */
  validator?: (values: T) => Record<string, string> | null;
}

/** Return type of {@link useCrudFormSubmit}. */
export interface UseCrudFormSubmitResult<T> {
  /** Whether the form is in edit mode (entity already exists). */
  isEdit: boolean;
  /** Submit handler that dispatches to create or update mutation. */
  handleSubmit: (values: T) => void;
  /** Whether the active mutation is pending. */
  isPending: boolean;
  /** Server validation errors keyed by field name. Empty when no errors. */
  fieldErrors: Record<string, string>;
  /**
   * What the server calls each refused field, keyed by field name. Empty when no errors, and
   * missing entries for fields the server labelled nothing.
   *
   * @remarks
   * A form can only name the fields it draws. When the server refuses one it does not — a field it
   * fills in itself, or one added to the DTO since — a summary that resolves names out of the
   * form's own catalogue has nothing to resolve and prints the lookup key at the reader. These are
   * the server's own names, already localized, so that case has something readable to fall back to.
   */
  fieldLabels: Record<string, string>;
}

/**
 * Handles create/update mutation dispatch for CRUD forms.
 * Determines whether to create or update based on `entityId` presence.
 *
 * Automatically extracts server validation errors (e.g. Spring Boot `errorDetail`)
 * and exposes them as `fieldErrors` for per-field error display.
 *
 * @remarks
 * Validation errors are suppressed from the global error dialog
 * (requires `MutationCache.onError` to skip `category === "validation"`).
 * Non-validation errors still propagate to the global dialog.
 *
 * @example
 * ```tsx
 * const { isEdit, handleSubmit, fieldErrors } = useCrudFormSubmit<FormValues>({
 *   entityId,
 *   create: adaptOrvalCreate(_create, { onSettled: invalidate }),
 *   update: adaptOrvalUpdate(_update, "id", { onSettled: invalidate }),
 *   onSuccess,
 * });
 *
 * <FormFields.TextField
 *   label={fieldLabel("name")}
 *   value={name}
 *   onChange={setName}
 *   error={fieldErrors["name"]}
 * />
 * ```
 *
 * @example With client-side validation (Zod):
 * ```tsx
 * import { zodToFieldErrors } from "@simplix-react/form";
 * import { createUserSchema, updateUserSchema } from "@my-app/domain-user";
 *
 * const { isEdit, handleSubmit, fieldErrors } = useCrudFormSubmit<FormValues>({
 *   entityId,
 *   create: adaptOrvalCreate(_create),
 *   update: adaptOrvalUpdate(_update, "userId"),
 *   validator: (v) => zodToFieldErrors(isEdit ? updateUserSchema : createUserSchema, v),
 *   onSuccess,
 * });
 * ```
 */
export function useCrudFormSubmit<T, TId = unknown>(
  options: UseCrudFormSubmitOptions<T, TId>,
): UseCrudFormSubmitResult<T> {
  const { entityId, create, update, onSuccess, i18nFields, locales, validator, fields, prepare } = options;
  const isEdit = entityId != null && entityId !== "";
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    (values: T) => {
      setFieldErrors({});
      setFieldLabels({});

      // ── client-side validation gate ──
      // Validator receives the raw form values (pre-i18n-fallback) so the
      // user's input is checked exactly as typed. On failure, skip the
      // server mutation entirely.
      const clientErrs = validator?.(values);
      if (clientErrs && Object.keys(clientErrs).length > 0) {
        setFieldErrors(clientErrs);
        return;
      }

      // The order matters and is the order a reader would do it by hand: tidy each value, decide
      // which empty boxes mean「not given」, derive the base columns from their maps, then drop the
      // form's own state. The i18n derivation comes after trimming so a map whose entries carry
      // stray space does not put that space in the column every read projection resolves from.
      let prepared: T = values;
      if (fields || i18nFields) {
        const next: Record<string, unknown> = { ...(values as Record<string, unknown>) };
        for (const name of fields?.trim ?? []) {
          const value = next[name];
          if (typeof value === "string") next[name] = value.trim();
        }
        for (const name of fields?.emptyToUndefined ?? []) {
          if (next[name] === "" || next[name] === null) next[name] = undefined;
        }
        if (i18nFields && locales) {
          for (const [i18nField, plainField] of Object.entries(i18nFields)) {
            const i18nValue = next[i18nField] as Record<string, string> | null | undefined;
            next[plainField] = applyI18nFallback(i18nValue, locales);
          }
        }
        for (const name of fields?.omit ?? []) delete next[name];
        prepared = next as T;
      }
      if (prepare) prepared = prepare(prepared);

      // Edit takes the update path when there is one; everything else is the create path, which
      // is what makes an upsert endpoint work with `update` omitted. A mode with neither mutation
      // is a wiring mistake rather than anything the reader did, so it says so rather than
      // failing quietly at the press.
      const doMutate =
        isEdit && update
          ? () => update.mutateAsync({ id: entityId, dto: prepared })
          : create
            ? () => create.mutateAsync(prepared)
            : null;
      if (!doMutate) {
        throw new Error(
          "useCrudFormSubmit: no mutation for this mode — "
            + (isEdit ? "edit mode needs `update` or `create`" : "create mode needs `create`"),
        );
      }

      doMutate()
        .then((result) => onSuccess?.(result))
        .catch((error: unknown) => {
          const errors = getValidationErrors(error);
          if (errors) {
            setFieldErrors(groupByField(errors));
            setFieldLabels(labelsByField(errors));
          }
        });
    },
    [isEdit, entityId, create, update, onSuccess, i18nFields, locales, validator],
  );

  const isPending = isEdit ? (update?.isPending ?? false) : (create?.isPending ?? false);

  return { isEdit, handleSubmit, isPending, fieldErrors, fieldLabels };
}

/**
 * What the server calls each refused field, for the fields it labelled.
 *
 * @param errors - Field errors as the server sent them.
 * @returns Server-supplied labels keyed by field name; fields with no label are absent.
 */
function labelsByField(
  errors: ValidationFieldError[],
): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const err of errors) {
    if (err.label && !labels[err.field]) labels[err.field] = err.label;
  }
  return labels;
}

function groupByField(
  errors: ValidationFieldError[],
): Record<string, string> {
  const grouped: Record<string, string> = {};
  for (const err of errors) {
    grouped[err.field] = grouped[err.field]
      ? `${grouped[err.field]}, ${err.message}`
      : err.message;
  }
  return grouped;
}
