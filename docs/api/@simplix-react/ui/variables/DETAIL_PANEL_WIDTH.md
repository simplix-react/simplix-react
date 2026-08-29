[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DETAIL\_PANEL\_WIDTH

# Variable: DETAIL\_PANEL\_WIDTH

> `const` **DETAIL\_PANEL\_WIDTH**: `768` = `768`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:147](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L147)

How much room the detail gets when the framework is the one deciding, in px.

<p><b>One number, because three were three different screens.</b> The panel column, the drawer
and the dialog were 600, 576 and 672, so an installation switching between them changed how much
content fits — a footer that cleared in one clipped in another, and an audit reading the narrow
one reported a screen defect that was really a setting.

<p><b>768 because the widest of the three was 672 and still too narrow.</b> The organization
detail's action row — four buttons, in English, at a 1280 viewport — pushed its last button
141px past the edge. At 768 that row ends 24px inside it.

<p><b>A screen that pins `listWidth` does not use this in panel mode</b>, and today every screen
in this console does: the list takes the width it asked for and the detail column takes whatever
remains, which is wider than 768 on a large monitor and narrower on a small one. So this unifies
the two presentations that float over the list and sets the default for the panel; making the
third agree as well would mean overriding a number each screen chose for its own list, which is
a different decision from this one.
