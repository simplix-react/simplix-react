// Polyfill URL.createObjectURL for jsdom — required by maplibre-gl
if (typeof globalThis.URL.createObjectURL !== "function") {
  globalThis.URL.createObjectURL = () => "";
}
if (typeof globalThis.URL.revokeObjectURL !== "function") {
  globalThis.URL.revokeObjectURL = () => {};
}
