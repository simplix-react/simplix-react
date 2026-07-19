import { requireOptionalNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

interface SimplixKioskNativeModule {
  isInLockTaskMode(): boolean;
  startLockTask(): Promise<void>;
  stopLockTask(): Promise<void>;
}

const nativeModule =
  requireOptionalNativeModule<SimplixKioskNativeModule>("SimplixKiosk");

/**
 * Whether Lock Task control is available on this device. `true` only on
 * Android builds that linked the kiosk native module. iPadOS cannot
 * self-pin — keep Guided Access / MDM Single App Mode as the operational
 * guide there.
 */
export function isLockTaskAvailable(): boolean {
  return Platform.OS === "android" && nativeModule !== null;
}

function requireLockTaskModule(): SimplixKioskNativeModule {
  if (Platform.OS !== "android") {
    throw new Error(
      "Lock Task Mode is Android-only. On iPadOS use Guided Access or MDM Single App Mode.",
    );
  }
  if (!nativeModule) {
    throw new Error(
      "SimplixKiosk native module is not linked — rebuild the dev client / EAS build with @simplix-react-native-ext/kiosk installed.",
    );
  }
  return nativeModule;
}

/**
 * Request Android screen pinning (Lock Task Mode). Under MDM /
 * dedicated-device provisioning this pins silently; otherwise Android asks
 * for the one-time screen-pinning confirmation.
 *
 * @throws when called on iOS or when the native module is absent — gate
 *   calls with {@link isLockTaskAvailable}.
 */
export async function startLockTask(): Promise<void> {
  await requireLockTaskModule().startLockTask();
}

/** Exit Android screen pinning. Same availability contract as {@link startLockTask}. */
export async function stopLockTask(): Promise<void> {
  await requireLockTaskModule().stopLockTask();
}

/** Whether the activity is currently pinned. `false` where unavailable. */
export function isInLockTaskMode(): boolean {
  if (!isLockTaskAvailable() || !nativeModule) return false;
  return nativeModule.isInLockTaskMode();
}
