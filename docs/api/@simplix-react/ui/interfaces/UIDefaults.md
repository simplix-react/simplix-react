[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UIDefaults

# Interface: UIDefaults

Defined in: [packages/ui/src/provider/ui-defaults-context.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-defaults-context.ts#L14)

Prop defaults a product sets once for its whole console.

<p><b>Why a channel rather than a better default.</b> Some choices are genuinely the product's
and not the framework's — how dense a row action should read depends on how often the people
using it open the console at all. The framework keeps a defensible default; a product that
wants another one says so in one place instead of in every screen, and a screen that forgets
to say it is then impossible rather than merely unlikely.

## Properties

### actionVariant

> **actionVariant**: [`ActionVariant`](../type-aliases/ActionVariant.md)

Defined in: [packages/ui/src/provider/ui-defaults-context.ts:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-defaults-context.ts#L22)

How a list or tree row draws its action cluster when the screen does not say.

<p>`"icon"` is the framework's own default: a compact strip that costs the least width and
asks the reader to know what each glyph means. A console whose readers open it rarely wants
`"ghost"`, where the label rides beside the icon.

***

### detailPresentation

> **detailPresentation**: `"panel"` \| `"drawer"`

Defined in: [packages/ui/src/provider/ui-defaults-context.ts:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-defaults-context.ts#L42)

How a list screen opens the record a reader picked, when the screen does not say.

<p>`"panel"` is the framework's own default and what every screen has drawn until now: the
detail takes a column beside the list, with a draggable divider between them. `"drawer"` slides
it in from the right edge over the full height instead, leaving the list at its full width
underneath.

<p><b>This is an installation's choice, not a screen's.</b> The two show the same detail, with
the same content, opened by the same act and closed back to the same list — what differs is
where it appears, which is a matter of how wide the operators' monitors are and how they like
to work. A screen that hardcodes one takes that choice away from every installation, which is
why it belongs here.

<p><b>`"dialog"` is deliberately not one of these.</b> A centred modal capped at `max-w-2xl`
is a different claim — that the record is a short interruption rather than the thing being
worked on — and a screen that wants it says so on its own `variant`. An installation-wide
switch between a panel and a drawer never turns a working surface into an interruption.
