// Self-registration of the built-in en/ko/ja locale bundle.
import "./locales";

export {
  useKeepAwake,
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from "./keep-awake";

export {
  isLockTaskAvailable,
  startLockTask,
  stopLockTask,
  isInLockTaskMode,
} from "./lock-task";

export { IdleResetProvider, useIdleReset } from "./idle-reset";
export type {
  IdleResetProviderProps,
  IdleResetContextValue,
} from "./idle-reset";

export { NetworkRecoveryGate } from "./network-recovery-gate";
export type { NetworkRecoveryGateProps } from "./network-recovery-gate";
