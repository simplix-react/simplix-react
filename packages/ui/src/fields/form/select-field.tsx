import { useTranslation } from "@simplix-react/i18n/react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldMessage } from "../shared/field-message";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link SelectField} form component. */
export interface SelectFieldProps<T extends string = string>
  extends CommonFieldProps {
  /** Currently selected value. */
  value: T;
  /** Called when the selection changes. */
  onChange: (value: T) => void;
  /** Available options with label/value pairs. */
  options: Array<{ label: string; value: T; disabled?: boolean; icon?: React.ReactNode; tag?: string }>;
  placeholder?: string;
  /**
   * Compact mode: renders without FieldWrapper, and sizes itself to its longest option label
   * using a hidden native `<select>`. That measurement also means `className` never reaches the
   * rendered element — pass `fill` when the parent has to own the width.
   *
   * `error` and `description` still render, below the trigger, so a compact field placed in a
   * table cell reports why a save was refused. `label` becomes the trigger's accessible name;
   * `required` draws no visible marker here, because compact mode has no label row to draw one
   * in. A compact field that has to show a required marker gets it from whatever names the
   * column (`List.Column`'s `required`).
   */
  compact?: boolean;
  /**
   * Compact mode only: give the width back to the parent. The hidden measuring `<select>` is
   * dropped, the field fills its container, and `className` lands on the wrapper — so a grid or
   * flex cell can size the field instead of the option list doing it. No effect without `compact`;
   * the non-compact path already passes `className` to the wrapper.
   */
  fill?: boolean;
  /**
   * Offer an entry that returns the field to unset.
   *
   * @remarks
   * A select can only ever move from one option to another, so a field the form declares optional
   * becomes permanent the moment somebody picks a value — the rank they set by mistake cannot be
   * taken off again, and the only way back is a column the screen does not offer. Pass this on
   * every select whose value the DTO accepts as absent.
   *
   * The entry sits at the top of the list, labelled with {@link clearLabel} or the framework's own
   * word for an empty choice, and hands `""` to `onChange`. Radix refuses an item whose value is
   * the empty string, so a sentinel carries it and is translated back before the caller sees it.
   */
  clearable?: boolean;
  /**
   * What the clearing entry reads as.
   *
   * @remarks
   * Defaults to `placeholder` — the field has already had to name its own empty state for the
   * trigger, and reading 「선택 안 함」 in the list and 「직위 없음」 on the trigger a moment later
   * is two words for one state on one control. Only where neither is given does the framework's
   * generic word stand in.
   */
  clearLabel?: string;
}

/**
 * What the clearing entry carries, since Radix refuses an item valued at the empty string.
 *
 * <p>Long and bracketed so it cannot collide with a real option's value.
 */
const CLEARED = "__simplix_select_cleared__";

/**
 * Dropdown select field built on Radix Select primitives.
 *
 * @remarks
 * Two widths, and which one applies is decided by `compact`. The default (non-compact) field
 * renders inside `FieldWrapper` and takes the width its container gives it, with `className`
 * reaching that wrapper. `compact` instead measures itself against its longest option label —
 * a hidden native `<select>` carrying every label does the measuring, so the field is as wide
 * as its widest option and `className` is dropped on the floor. Pass `fill` alongside `compact`
 * to take that measurement out and let the parent set the width.
 *
 * `required` maps to `aria-required` in every mode, and draws a visible marker only where there
 * is a label row to draw it in.
 *
 * @example
 * ```tsx
 * <SelectField
 *   label="Role"
 *   value={role}
 *   onChange={setRole}
 *   options={[
 *     { label: "Admin", value: "admin" },
 *     { label: "User", value: "user" },
 *   ]}
 * />
 *
 * // Compact mode (no label, auto-width, for table cells)
 * <SelectField
 *   compact
 *   value={scheduleId}
 *   onChange={setScheduleId}
 *   options={scheduleOptions}
 *   placeholder="Select..."
 * />
 *
 * // Compact mode whose width the parent owns (a grid cell, a flex row)
 * <SelectField
 *   compact
 *   fill
 *   className="min-w-0"
 *   value={areaId}
 *   onChange={setAreaId}
 *   options={areaOptions}
 * />
 * ```
 */
export function SelectField<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  compact = false,
  fill = false,
  clearable = false,
  clearLabel,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: SelectFieldProps<T>) {
  const { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");

  // A required field has no empty state to return to, so the entry is withheld there however the
  // caller asked — offering it would put a value in the list the form then refuses to submit.
  const offersClearing = clearable && !required;
  const clearText = clearLabel ?? placeholder ?? t("field.noSelection");

  // `id` lands on the trigger button — the labelable element the wrapper's
  // label points at. Compact mode has no wrapper and so no id.
  const renderSelect = (id?: string) => (
    <Select
      value={value}
      onValueChange={(v) => onChange((v === CLEARED ? "" : v) as T)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-invalid={!!error}
        aria-required={required || undefined}
        aria-label={compact ? label ?? placeholder : variantProps.layout === "hidden" ? label : undefined}
        className={compact ? "h-8 text-sm" : undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {offersClearing && (
          <SelectItem value={CLEARED}>
            <span className="text-muted-foreground">{clearText}</span>
          </SelectItem>
        )}
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
          >
            {opt.icon || opt.tag ? (
              <span className="flex w-full items-center gap-1.5">
                {opt.icon}
                <span>{opt.label}</span>
                {opt.tag && (
                  <span className="ml-auto text-xs text-muted-foreground">{opt.tag}</span>
                )}
              </span>
            ) : (
              opt.label
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // Compact mode has no label row, but a field whose save was refused still has to say why —
  // otherwise the only trace of the rejection is the save button's error COUNT, and the cell the
  // count is about looks untouched. The messages sit under the control, exactly where
  // FieldWrapper puts them, so a compact field and a labelled one report a failure the same way.
  const compactMessages = (description || error) ? (
    <>
      {description && <FieldMessage variant="description">{description}</FieldMessage>}
      {error && <FieldMessage variant="error">{error}</FieldMessage>}
    </>
  ) : null;

  if (compact && fill) {
    // No measuring select: the trigger is `w-full`, so the width is whatever the parent gives.
    if (!compactMessages) {
      return <span className={cn("block w-full", className)}>{renderSelect()}</span>;
    }
    // Wrapped only when there is something to say: without a message the field keeps the exact
    // box it had before, so the trigger stays the outermost element.
    return (
      <div className={cn("flex w-full flex-col gap-1", className)}>
        {renderSelect()}
        {compactMessages}
      </div>
    );
  }

  if (compact) {
    const sized = (
      <span className="inline-grid items-center">
        {/* Hidden native select: browser auto-sizes to longest option label */}
        <select
          className="invisible col-start-1 row-start-1 h-8 appearance-none border px-3 pr-8 text-sm"
          aria-hidden="true"
          tabIndex={-1}
        >
          {placeholder && <option>{placeholder}</option>}
          {offersClearing && <option>{clearText}</option>}
          {options.map((opt) => (
            <option key={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="col-start-1 row-start-1">{renderSelect()}</span>
      </span>
    );
    // Wrapped only when there is something to say: without a message the field keeps the exact
    // box it had before, so the measuring grid stays the outermost element.
    return compactMessages ? (
      <div className="inline-flex flex-col gap-1">
        {sized}
        {compactMessages}
      </div>
    ) : sized;
  }

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      {...variantProps}
    >
      {({ id }) => renderSelect(id)}
    </FieldWrapper>
  );
}
