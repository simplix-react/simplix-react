import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { View } from "react-native";
import { useColorScheme, vars } from "nativewind";

import {
  resolveThemeTokens,
  type ColorTokenMap,
  type ThemePresetName,
} from "./tokens";

/** Brand font override seam — family names registered in the consuming app. */
export interface ThemeFonts {
  sans?: string;
  display?: string;
  mono?: string;
}

/** Per-scheme color token overrides layered on top of the resolved preset. */
export interface ThemeTokenOverrides {
  light?: ColorTokenMap;
  dark?: ColorTokenMap;
}

/** Context value exposed by {@link SimplixThemeProvider}. */
export interface SimplixThemeContextValue {
  /** Active color preset (mirrors the web `data-color-theme` values). */
  preset: ThemePresetName;
  setPreset: (preset: ThemePresetName) => void;
  /** Effective color scheme after system resolution. */
  colorScheme: "light" | "dark";
  /** Switch scheme; `"system"` follows the OS appearance. */
  setColorScheme: (scheme: "light" | "dark" | "system") => void;
  /** Brand fonts applied by the typography primitives. */
  fonts: ThemeFonts;
  /** Resolved color token map for the active preset + scheme. */
  tokens: ColorTokenMap;
}

const SimplixThemeContext = createContext<SimplixThemeContextValue | null>(null);

/** Props for {@link SimplixThemeProvider}. */
export interface SimplixThemeProviderProps {
  /** Initial color preset. Defaults to `"default"`. */
  preset?: ThemePresetName;
  /** App-level token overrides (tone seeds, categorical accents). */
  overrides?: ThemeTokenOverrides;
  /** Brand fonts applied by `Text` / `Heading`. */
  fonts?: ThemeFonts;
  children: ReactNode;
}

/**
 * Injects the simplix color tokens as CSS variables (NativeWind `vars()`) on a
 * root view, so every descendant utility class (`bg-background`,
 * `text-foreground`, …) resolves against the active preset and scheme.
 *
 * Mount once at the app root, inside the NativeWind setup:
 *
 * ```tsx
 * <SimplixThemeProvider preset="blue">
 *   <Slot />
 * </SimplixThemeProvider>
 * ```
 */
export function SimplixThemeProvider({
  preset: initialPreset = "default",
  overrides,
  fonts,
  children,
}: SimplixThemeProviderProps) {
  const [preset, setPreset] = useState<ThemePresetName>(initialPreset);
  const { colorScheme, setColorScheme } = useColorScheme();
  const scheme: "light" | "dark" = colorScheme === "dark" ? "dark" : "light";

  const tokens = useMemo(() => {
    const resolved = resolveThemeTokens(preset, scheme);
    const schemeOverrides = overrides?.[scheme];
    return schemeOverrides ? { ...resolved, ...schemeOverrides } : resolved;
  }, [preset, scheme, overrides]);

  const value = useMemo<SimplixThemeContextValue>(
    () => ({
      preset,
      setPreset,
      colorScheme: scheme,
      setColorScheme,
      fonts: fonts ?? {},
      tokens,
    }),
    [preset, scheme, setColorScheme, fonts, tokens],
  );

  return (
    <SimplixThemeContext.Provider value={value}>
      <View style={vars(tokens)} className="flex-1 bg-background">
        {children}
      </View>
    </SimplixThemeContext.Provider>
  );
}

/**
 * Access the active theme (preset, scheme, resolved tokens, brand fonts).
 * Must be called under {@link SimplixThemeProvider}.
 */
export function useSimplixTheme(): SimplixThemeContextValue {
  const ctx = useContext(SimplixThemeContext);
  if (!ctx) {
    throw new Error("useSimplixTheme must be used within SimplixThemeProvider");
  }
  return ctx;
}

/** Brand fonts of the active theme; empty object outside the provider. */
export function useThemeFonts(): ThemeFonts {
  return useContext(SimplixThemeContext)?.fonts ?? {};
}
