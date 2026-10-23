import { defineSlotStyle } from "../../../design/slot-style";

/** The inline code leaf. */
export const plateCodeLeafStyle = defineSlotStyle({
  slot: "plate-code-leaf",
  base: "bg-muted px-1.5 py-0.5 rounded text-sm font-mono",
  variants: {},
  defaultVariants: {},
});

/** The code block element. */
export const plateCodeBlockStyle = defineSlotStyle({
  slot: "plate-code-block",
  base: "my-4 rounded-lg bg-muted p-4 font-mono text-sm",
  variants: {},
  defaultVariants: {},
});

/** A syntax highlighted token; `token` is the token type. */
export const plateCodeSyntaxStyle = defineSlotStyle({
  slot: "plate-code-syntax",
  base: "",
  variants: {
    token: {
      comment: "text-gray-500",
      prolog: "text-gray-500",
      doctype: "text-gray-500",
      cdata: "text-gray-500",
      punctuation: "text-gray-400",
      property: "text-blue-400",
      tag: "text-pink-400",
      boolean: "text-orange-400",
      number: "text-orange-400",
      constant: "text-orange-400",
      symbol: "text-orange-400",
      selector: "text-green-400",
      "attr-name": "text-green-400",
      string: "text-green-400",
      char: "text-green-400",
      builtin: "text-cyan-400",
      operator: "text-yellow-400",
      entity: "text-yellow-400",
      url: "text-yellow-400",
      variable: "text-red-400",
      atrule: "text-purple-400",
      "attr-value": "text-purple-400",
      function: "text-blue-400",
      keyword: "text-purple-400",
      regex: "text-red-400",
      important: "text-red-400 font-bold",
    },
  },
  defaultVariants: {},
});
