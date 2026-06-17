import { createContext, useContext } from "react";
import type { FileFieldConfig } from "../fields/file-attachment/types";

/**
 * Framework-internal channel for a server-provided default {@link FileFieldConfig}
 * (e.g. an upload policy). Populated by the app-config provider's reserved
 * `filePolicy` key (see {@link createAppConfig}) and consumed by `FileField` /
 * `ImageField` as the precedence-Y default:
 *
 *   instance `config` prop  →  this server policy  →  framework DEFAULT
 *
 * Undefined when no policy was injected or it has not loaded — fields then fall
 * back to the instance config / framework defaults.
 */
export const FilePolicyContext = createContext<FileFieldConfig | undefined>(undefined);

/** Read the injected server-default FileField config (undefined when absent). */
export function useFilePolicy(): FileFieldConfig | undefined {
  return useContext(FilePolicyContext);
}

/**
 * Resolve the effective FileField config with precedence **Y**: the injected
 * server policy wins per field, the instance `config` fills the gaps, and the
 * framework defaults apply downstream for anything still unset. When no server
 * policy is present this returns the instance config unchanged (no behavior
 * change for hosts that do not inject a policy).
 */
export function useResolvedFileFieldConfig(
  config?: FileFieldConfig,
): FileFieldConfig | undefined {
  const policy = useFilePolicy();
  if (!policy) return config;
  if (!config) return policy;
  return {
    maxAttachments: policy.maxAttachments ?? config.maxAttachments,
    maxFileSize: policy.maxFileSize ?? config.maxFileSize,
    allowedExtensions: policy.allowedExtensions ?? config.allowedExtensions,
    allowedMimeTypes: policy.allowedMimeTypes ?? config.allowedMimeTypes,
  };
}
