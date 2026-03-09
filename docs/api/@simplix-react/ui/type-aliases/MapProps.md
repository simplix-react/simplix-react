[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / MapProps

# Type Alias: MapProps

> **MapProps** = `object` & `Omit`\<`MapLibreGL.MapOptions`, `"container"` \| `"style"`\>

Defined in: [packages/ui/src/base/map/map.tsx:181](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/map/map.tsx#L181)

Props for the [Map](../variables/Map.md) component.

## Type Declaration

### children?

> `optional` **children**: `ReactNode`

### className?

> `optional` **className**: `string`

### fallbackTileUrl?

> `optional` **fallbackTileUrl**: `string`

PMTiles file URL for offline fallback (e.g. "/offline-map.pmtiles").

### onError()?

> `optional` **onError**: () => `void`

#### Returns

`void`

### projection?

> `optional` **projection**: `ProjectionSpecification`

### styles?

> `optional` **styles**: `object`

#### styles.dark?

> `optional` **dark**: [`MapStyleOption`](MapStyleOption.md)

#### styles.light?

> `optional` **light**: [`MapStyleOption`](MapStyleOption.md)

### theme?

> `optional` **theme**: [`MapTheme`](MapTheme.md)
