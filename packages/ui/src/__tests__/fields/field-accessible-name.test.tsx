// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CheckboxField } from "../../fields/form/checkbox-field";
import { ColorField } from "../../fields/form/color-field";
import { ComboboxField } from "../../fields/form/combobox-field";
import { CountryField } from "../../fields/form/country-field";
import { CurrencyField } from "../../fields/form/currency-field";
import { DateField } from "../../fields/form/date-field";
import { DateRangeField } from "../../fields/form/date-range-field";
import { DateTimeField } from "../../fields/form/datetime-field";
import { Field } from "../../fields/form/field";
import { I18nTextField } from "../../fields/form/i18n-text-field";
import { I18nTextareaField } from "../../fields/form/i18n-textarea-field";
import { IconField } from "../../fields/form/icon-field";
import { MultiSelectField } from "../../fields/form/multi-select-field";
import { NumberField } from "../../fields/form/number-field";
import { PasswordField } from "../../fields/form/password-field";
import { PhoneField } from "../../fields/form/phone-field";
import { RadioGroupField } from "../../fields/form/radio-group-field";
import { SelectField } from "../../fields/form/select-field";
import { SliderField } from "../../fields/form/slider-field";
import { SwitchField } from "../../fields/form/switch-field";
import { TextField } from "../../fields/form/text-field";
import { TextareaField } from "../../fields/form/textarea-field";
import { TimeField } from "../../fields/form/time-field";
import { TimezoneField } from "../../fields/form/timezone-field";
import { TreeMultiSelectField } from "../../fields/form/tree-multi-select-field";
import { TreeSelectField } from "../../fields/form/tree-select-field";

afterEach(cleanup);

const LABEL = "Field label";
const noop = vi.fn();
const options = [{ label: "One", value: "one" }];
const treeData = [{ id: "one", name: "One" }];
const languages = [{ code: "en", name: "English", englishName: "English" }] as const;

/**
 * Every form field, with the smallest prop set that renders it. A field whose
 * label reaches no control is invisible to assistive technology, so this list
 * is the census — a new field belongs in it.
 */
const fields: Array<[name: string, render: () => ReactElement]> = [
  ["TextField", () => <TextField label={LABEL} value="" onChange={noop} />],
  ["PasswordField", () => <PasswordField label={LABEL} value="" onChange={noop} />],
  ["TextareaField", () => <TextareaField label={LABEL} value="" onChange={noop} />],
  ["NumberField", () => <NumberField label={LABEL} value={null} onChange={noop} />],
  ["SliderField", () => <SliderField label={LABEL} value={1} onChange={noop} />],
  ["ColorField", () => <ColorField label={LABEL} value="#000000" onChange={noop} />],
  ["SelectField", () => <SelectField label={LABEL} value="one" onChange={noop} options={options} />],
  ["SwitchField", () => <SwitchField label={LABEL} value={false} onChange={noop} />],
  ["CheckboxField", () => <CheckboxField label={LABEL} value={false} onChange={noop} />],
  ["RadioGroupField", () => <RadioGroupField label={LABEL} value="one" onChange={noop} options={options} />],
  ["ComboboxField", () => <ComboboxField label={LABEL} value="one" onChange={noop} options={options} />],
  ["MultiSelectField", () => <MultiSelectField label={LABEL} value={[]} onChange={noop} options={options} />],
  ["TreeSelectField", () => <TreeSelectField label={LABEL} value={null} onChange={noop} treeData={treeData} />],
  ["TreeMultiSelectField", () => <TreeMultiSelectField label={LABEL} value={[]} onChange={noop} treeData={treeData} />],
  ["CountryField", () => <CountryField label={LABEL} value="" onChange={noop} />],
  ["CurrencyField", () => <CurrencyField label={LABEL} value="" onChange={noop} />],
  ["TimezoneField", () => <TimezoneField label={LABEL} value="" onChange={noop} />],
  ["PhoneField", () => <PhoneField label={LABEL} value="" onChange={noop} />],
  ["IconField", () => <IconField label={LABEL} value="" onChange={noop} />],
  ["DateField", () => <DateField label={LABEL} value={null} onChange={noop} />],
  ["DateTimeField", () => <DateTimeField label={LABEL} value={null} onChange={noop} />],
  ["DateRangeField", () => <DateRangeField label={LABEL} value={{ from: undefined, to: undefined }} onChange={noop} />],
  ["TimeField", () => <TimeField label={LABEL} value={null} onChange={noop} />],
  ["I18nTextField", () => <I18nTextField label={LABEL} value={{}} onChange={noop} languages={[...languages]} />],
  ["I18nTextareaField", () => <I18nTextareaField label={LABEL} value={{}} onChange={noop} languages={[...languages]} />],
  ["Field (custom content)", () => <Field label={LABEL}>{({ id }) => <input id={id} />}</Field>],
  ["Field (plain children)", () => <Field label={LABEL}><input aria-label="inner" /></Field>],
];

describe("form field accessible names", () => {
  it.each(fields)("%s exposes its label to assistive technology", (_name, element) => {
    render(element());
    // Either the control itself carries the name, or — for a composite with no
    // labelable element — the field's group does.
    expect(screen.getAllByLabelText(LABEL).length).toBeGreaterThan(0);
  });
});

describe("FieldWrapper label association", () => {
  it("points the label at the control it wraps", () => {
    render(<TextField label={LABEL} value="" onChange={noop} />);
    const input = screen.getByRole("textbox");
    const label = document.querySelector("label");
    expect(input.id).not.toBe("");
    expect(label?.getAttribute("for")).toBe(input.id);
  });

  it("does not name the group when the control names itself", () => {
    render(<TextField label={LABEL} value="" onChange={noop} />);
    expect(screen.getByRole("group").getAttribute("aria-labelledby")).toBeNull();
  });

  it("names the group when the children take no id", () => {
    render(
      <Field label={LABEL}>
        <input aria-label="inner" />
      </Field>,
    );
    const group = screen.getByRole("group");
    const labelledBy = group.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toContain(LABEL);
  });
});
