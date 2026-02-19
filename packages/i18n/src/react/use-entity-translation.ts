import { useCallback, useMemo } from "react";
import { useTranslation } from "./use-translation.js";

/**
 * Represents the return value of the {@link useEntityTranslation} hook.
 */
export interface UseEntityTranslationReturn {
  /** Returns the translated label for an entity field. */
  fieldLabel: (fieldName: string) => string;
  /** Returns the translated label for an enum value. */
  enumLabel: (enumName: string, value: string) => string;
}

/**
 * Provides translated labels for entity fields and enum values.
 *
 * Uses the `entity/{entityName}` namespace for field labels and the
 * global `enums` namespace for enum values.
 *
 * @param entity - The entity name (e.g., `"pet"`, `"order"`).
 * @returns A {@link UseEntityTranslationReturn} with `fieldLabel` and `enumLabel` functions.
 *
 * @example
 * ```tsx
 * import { useEntityTranslation } from "@simplix-react/i18n/react";
 *
 * function PetForm() {
 *   const { fieldLabel, enumLabel } = useEntityTranslation("pet");
 *
 *   return (
 *     <div>
 *       <label>{fieldLabel("name")}</label>
 *       <span>{enumLabel("petStatus", "available")}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEntityTranslation(
  entity: string,
): UseEntityTranslationReturn {
  const { t: fieldT } = useTranslation(`entity/${entity}`);
  const { t: enumT } = useTranslation("enums");

  const fieldLabel = useCallback(
    (fieldName: string) => fieldT(`fields.${fieldName}`),
    [fieldT],
  );

  const enumLabel = useCallback(
    (enumName: string, value: string) => enumT(`${enumName}.${value}`),
    [enumT],
  );

  return useMemo(() => ({ fieldLabel, enumLabel }), [fieldLabel, enumLabel]);
}
