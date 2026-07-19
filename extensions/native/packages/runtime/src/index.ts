// ── Token stores ──
export type { NativeTokenStore } from "./token-store/types";
export { createSecureTokenStore } from "./token-store/secure-token-store";
export type { SecureTokenStoreOptions } from "./token-store/secure-token-store";
export { createAsyncStorageTokenStore } from "./token-store/async-storage-token-store";
export type { AsyncStorageTokenStoreOptions } from "./token-store/async-storage-token-store";

// ── Mutator assembly ──
export {
  createNativeBootMutator,
  configureNativeBootMutator,
} from "./mutator/create-boot-mutator";
export type {
  NativeBootMutatorOptions,
  UnauthorizedContext,
} from "./mutator/create-boot-mutator";

// ── i18n ──
export { createNativeI18n } from "./i18n/create-native-i18n";
export type { CreateNativeI18nOptions } from "./i18n/create-native-i18n";

// ── Error surface ──
export { dispatchError, clearError, useErrorEvent } from "./error/error-store";
export { ErrorDialogHost } from "./error/error-dialog-host";

// ── App boot ──
export { createNativeQueryClient } from "./boot/query-client";
export type { CreateNativeQueryClientOptions } from "./boot/query-client";
export { SimplixNativeProvider } from "./boot/simplix-native-provider";
export type { SimplixNativeProviderProps } from "./boot/simplix-native-provider";

// ── Mock wiring ──
export { startNativeMocks } from "./mock/start-native-mocks";
export type {
  StartNativeMocksOptions,
  NativeMockServer,
} from "./mock/start-native-mocks";
