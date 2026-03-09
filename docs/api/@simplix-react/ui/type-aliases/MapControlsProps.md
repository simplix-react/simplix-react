[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / MapControlsProps

# Type Alias: MapControlsProps

> **MapControlsProps** = `object`

Defined in: [packages/ui/src/base/map/map.tsx:379](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/map/map.tsx#L379)

Props for the [MapControls](../functions/MapControls.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/map/map.tsx:391](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/map/map.tsx#L391)

Additional CSS classes for the control group.

***

### onCompass()?

> `optional` **onCompass**: () => `void`

Defined in: [packages/ui/src/base/map/map.tsx:395](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/map/map.tsx#L395)

Custom handler for compass button. Replaces default resetNorthPitch.

#### Returns

`void`

***

### onLocate()?

> `optional` **onLocate**: (`coords`) => `void`

Defined in: [packages/ui/src/base/map/map.tsx:393](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/map/map.tsx#L393)

Callback with user coordinates when located.

#### Parameters

##### coords

###### latitude

`number`

###### longitude

`number`

#### Returns

`void`

***

### position?

> `optional` **position**: [`MapControlsPosition`](MapControlsPosition.md)

Defined in: [packages/ui/src/base/map/map.tsx:381](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/map/map.tsx#L381)

Placement location for the controls.

***

### showCompass?

> `optional` **showCompass**: `boolean`

Defined in: [packages/ui/src/base/map/map.tsx:385](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/map/map.tsx#L385)

Enable compass button to reset bearing.

***

### showFullscreen?

> `optional` **showFullscreen**: `boolean`

Defined in: [packages/ui/src/base/map/map.tsx:389](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/map/map.tsx#L389)

Enable fullscreen toggle button.

***

### showLocate?

> `optional` **showLocate**: `boolean`

Defined in: [packages/ui/src/base/map/map.tsx:387](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/map/map.tsx#L387)

Enable locate button for user's location.

***

### showZoom?

> `optional` **showZoom**: `boolean`

Defined in: [packages/ui/src/base/map/map.tsx:383](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/map/map.tsx#L383)

Enable zoom in/out buttons.
