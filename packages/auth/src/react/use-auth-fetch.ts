import type { FetchFn } from "@simplix-react/contract";
import { useAuthContext } from "./auth-provider.js";

/**
 * Returns the authenticated {@link FetchFn} from the nearest {@link AuthProvider}.
 *
 * Use this when you need to make authenticated requests outside of
 * the standard `useQuery`/`useMutation` hooks.
 *
 * @example
 * ```tsx
 * function FileUploader() {
 *   const fetchFn = useAuthFetch();
 *
 *   async function upload(file: File) {
 *     const formData = new FormData();
 *     formData.append("file", file);
 *     await fetchFn("/api/upload", { method: "POST", body: formData });
 *   }
 *
 *   return <input type="file" onChange={(e) => upload(e.target.files![0])} />;
 * }
 * ```
 */
export function useAuthFetch(): FetchFn {
  const auth = useAuthContext();
  return auth.fetchFn;
}
