import type { TokenStore } from "./types.js";
import { localStorageStore } from "./stores/local-storage-store.js";
import { sessionStorageStore } from "./stores/session-storage-store.js";

/** What one app's stay-signed-in preference offers. */
export interface RememberMe {
  /** A token store that keeps the session only as long as the operator asked for. */
  readonly rememberMeStore: (prefix: string) => TokenStore;
  /** Whether this machine is currently set to stay signed in. */
  readonly isRemembered: () => boolean;
  /** Records the choice. Called before the credential exchange. */
  readonly setRemembered: (remember: boolean) => void;
}

/**
 * The stay-signed-in preference and the token store that answers to it.
 *
 * <p><b>One implementation, one namespace per app.</b> Written out per app it was written three
 * times and two of them still carried the namespace of the console this one was replicated from —
 * so the worker app and the kiosk app wrote their preference to the same key, under a third
 * product's name. Nothing errors when two apps share a preference key; they simply agree about
 * something they were never asked to agree about.
 *
 * <p><b>The preference is deliberately outside the token store's own prefix.</b> Signing out
 * clears that prefix by sweeping every key under it, and this is not a token — it is what decides
 * which backing the NEXT token pair goes to. Kept alongside them it would be erased by the one act
 * it has to survive, and every sign-out would silently return the box to unchecked on the screen
 * the operator was just sent back to (frontend invariant #59).
 *
 * @param namespace the app's own name, which is what keeps two apps' preferences apart
 * @returns the store and the two readers of the preference
 */
export function createRememberMe(namespace: string): RememberMe {
  const preferenceKey = `${namespace}.prefs:remember-me`;

  const isRemembered = (): boolean => {
    try {
      return localStorage.getItem(preferenceKey) === "1";
    } catch {
      return false;
    }
  };

  const setRemembered = (remember: boolean): void => {
    try {
      if (remember) localStorage.setItem(preferenceKey, "1");
      else localStorage.removeItem(preferenceKey);
    } catch {
      /* storage unavailable — the session stays per-tab, which is the safe side */
    }
  };

  /**
   * <p>Checked, the tokens go to `localStorage` and the operator stays signed in on this machine
   * across browser restarts. Unchecked, they go to `sessionStorage` and the session dies with the
   * tab — which is what somebody on a shared workstation needs.
   *
   * <p>Reads consult both backings so a choice made mid-session does not orphan the tokens already
   * written, and writes clear the other side so one token pair never survives in two places.
   */
  const rememberMeStore = (prefix: string): TokenStore => {
    const persistent = localStorageStore(prefix);
    const perTab = sessionStorageStore(prefix);

    const chosen = () => (isRemembered() ? persistent : perTab);
    const other = () => (isRemembered() ? perTab : persistent);

    return {
      get: (key) => chosen().get(key) ?? other().get(key),
      set: (key, value) => {
        other().remove(key);
        chosen().set(key, value);
      },
      remove: (key) => {
        persistent.remove(key);
        perTab.remove(key);
      },
      clear: () => {
        persistent.clear();
        perTab.clear();
      },
    };
  };

  return { rememberMeStore, isRemembered, setRemembered };
}
