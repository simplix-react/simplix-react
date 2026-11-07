import { serverMessage } from "@simplix-react/api";
import { addToast } from "@simplix-react/headless";
import { type QueryClient, type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

import { readsUnder } from "./use-invalidate-entity";

/**
 * What a generated mutation hook is called with and answers: the options object Orval and SimpliX
 * Meta both emit (`{ mutation?: { meta?, ... } }`) and a result with `mutateAsync` and `isPending`.
 *
 * @typeParam TVariables - What the command is run with.
 * @typeParam TData - What the server answers a successful run with.
 */
export type CommandMutationHook<TVariables, TData> = (options?: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation?: { meta?: Record<string, unknown> } & Record<string, any>;
}) => {
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isPending: boolean;
};

/**
 * The words a command says when it succeeds: a sentence, or one built from what it was run with
 * and what the server answered.
 */
export type CommandDone<TVariables, TData> = string | ((data: TData, variables: TVariables) => string);

/**
 * The words a command says when it fails.
 *
 * A sentence is shown only when the server sent none of its own (`serverMessage(caught) ?? failed`).
 * A function is always called, with the server's sentence as `reason` (or `undefined`), so a
 * catalog entry such as 「Could not cancel: {{reason}}」 can carry it.
 */
export type CommandFailed<TVariables> =
  | string
  | ((reason: string | undefined, variables: TVariables, caught: unknown) => string);

/**
 * What a command refreshes once it has written. A string is an API prefix and refreshes every
 * query whose first key element starts with it, the way {@link useInvalidateEntity} does (a
 * generated `<entity>EntityPath` fits here); an array is one query key, refreshed by prefix match
 * on its elements, the way `queryClient.invalidateQueries({ queryKey })` does.
 */
export type CommandInvalidation = string | QueryKey;

/** Options for {@link useCommand}. */
export interface UseCommandOptions<TVariables, TData> {
  /** Toasted as success once the write is accepted. */
  done: CommandDone<TVariables, TData>;
  /** Toasted as an error when the write is refused or fails. */
  failed: CommandFailed<TVariables>;
  /** Refreshed once the server has answered, accepted or refused, before `run` resolves. */
  invalidate?: readonly CommandInvalidation[] | ((variables: TVariables) => readonly CommandInvalidation[]);
  /**
   * Leaves the app's error dialog on for this mutation as well as the toast. Off by default: a
   * command that toasts its own failure and also raises the dialog tells the reader twice.
   */
  keepDialog?: boolean;
}

/** How one run of a command ended. */
export type CommandOutcome<TData> = { ok: true; data: TData } | { ok: false; error: unknown };

/** What {@link useCommand} returns. */
export interface UseCommandResult<TVariables, TData> {
  /**
   * Runs the command: writes, toasts the outcome, and refreshes what it changed. Never rejects;
   * the outcome says whether the write was accepted, so a caller closes a dialog only on success.
   */
  run: (variables: TVariables) => Promise<CommandOutcome<TData>>;
  /** Whether a run is waiting for the server. */
  pending: boolean;
}

/**
 * Marks a mutation as one whose failure the screen reports itself, so the app's mutation cache
 * does not also raise its error dialog. Shared by {@link useCommand} and any hand-built call that
 * toasts its own refusal.
 */
export const OWN_REFUSAL_META = { suppressErrorDialog: true } as const;

/**
 * Runs a user's command the one way every screen runs one: it writes, toasts the outcome in the
 * reader's words, puts the server's own reason in the failure, refreshes what it changed, and
 * keeps the app's error dialog out of it, so a refusal is said once.
 *
 * Pass the generated mutation hook itself, not its result: the error-dialog flag is part of the
 * mutation's options, which only the hook call can set.
 *
 * @example
 * ```tsx
 * const revoke = useCommand(useDeleteMyDevice, {
 *   done: (_, { deviceId }) => t("signedOut", { device: nameOf(deviceId) }),
 *   failed: (reason) => t("signOutFailed", { reason }),
 *   invalidate: [getGetAllMyDevicesQueryKey()],
 * });
 * <Button disabled={revoke.pending} onClick={() => void revoke.run({ deviceId })} />
 * ```
 *
 * @param useMutationHook - The generated mutation hook the command calls.
 * @param options - Its words, what it refreshes, and whether the error dialog stays on.
 * @returns `run(variables)` and whether a run is pending.
 */
export function useCommand<TVariables = void, TData = unknown>(
  useMutationHook: CommandMutationHook<TVariables, TData>,
  options: UseCommandOptions<TVariables, TData>,
): UseCommandResult<TVariables, TData> {
  const mutation = useMutationHook(options.keepDialog ? undefined : { mutation: { meta: OWN_REFUSAL_META } });
  const queryClient = useQueryClient();
  // The options are read when a run settles, so a run started before a re-render toasts the words
  // of the render that is current when it answers rather than of the one that started it.
  const latest = useRef(options);
  latest.current = options;
  const { mutateAsync } = mutation;

  const run = useCallback(
    async (variables: TVariables): Promise<CommandOutcome<TData>> => {
      const refresh = () => {
        const { invalidate } = latest.current;
        const keys = typeof invalidate === "function" ? invalidate(variables) : (invalidate ?? []);
        return Promise.all(keys.map((key) => invalidateOne(queryClient, key)));
      };
      let data: TData;
      try {
        data = await mutateAsync(variables);
      } catch (caught) {
        addToast({ type: "error", message: failureText(latest.current.failed, variables, caught) });
        // A refusal can mean the record moved under the reader (somebody else already did it), so
        // what the command touches is read again either way.
        await refresh();
        return { ok: false, error: caught };
      }
      const { done } = latest.current;
      addToast({ type: "success", message: typeof done === "function" ? done(data, variables) : done });
      await refresh();
      return { ok: true, data };
    },
    [mutateAsync, queryClient],
  );

  return { run, pending: mutation.isPending };
}

/** Options for {@link runWithToast}. */
export interface RunWithToastOptions<T> {
  /** Toasted as success once the action resolves. */
  done: string | ((value: T) => string);
  /** Toasted as an error when it rejects; a sentence stands in only where the server sent none. */
  failed: string | ((reason: string | undefined, caught: unknown) => string);
}

/**
 * Runs an async verb that is not a single mutation (a download, two writes in a row, a call to a
 * provider) and toasts how it ended, with the same words rule as {@link useCommand}. Never rejects.
 *
 * @param action - The verb to run.
 * @param options - What to say on success and on failure.
 * @returns How the run ended.
 */
export async function runWithToast<T>(action: () => Promise<T>, options: RunWithToastOptions<T>): Promise<CommandOutcome<T>> {
  let value: T;
  try {
    value = await action();
  } catch (caught) {
    const { failed } = options;
    const reason = serverMessage(caught);
    addToast({ type: "error", message: typeof failed === "function" ? failed(reason, caught) : (reason ?? failed) });
    return { ok: false, error: caught };
  }
  addToast({ type: "success", message: typeof options.done === "function" ? options.done(value) : options.done });
  return { ok: true, data: value };
}

function failureText<TVariables>(failed: CommandFailed<TVariables>, variables: TVariables, caught: unknown): string {
  const reason = serverMessage(caught);
  return typeof failed === "function" ? failed(reason, variables, caught) : (reason ?? failed);
}

function invalidateOne(queryClient: QueryClient, key: CommandInvalidation): Promise<void> {
  return typeof key === "string"
    ? queryClient.invalidateQueries({ predicate: readsUnder(key) })
    : queryClient.invalidateQueries({ queryKey: key });
}
