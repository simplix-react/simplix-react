/** Minimal mutation shape consumed by form submit helpers on every platform. */
export interface CrudMutation<TInput> {
  /** Trigger the mutation with the given input. */
  mutate: (input: TInput, options?: { onSuccess?: () => void }) => void;
  /** Promise-based mutation trigger for error handling. */
  mutateAsync: (input: TInput) => Promise<unknown>;
  /** Whether the mutation is currently in flight. */
  isPending: boolean;
}
