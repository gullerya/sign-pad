# API

`sign-pad` is a fully featured web-component.

## `sign-pad` component

Make sure `sign-pad` web component initialized:
```js
import 'sign-pad.js';
```

Having that, use the component directly in HTML:
```html
<sign-pad></sign-pad>
```

`sign-pad` will render a drawing surface, track user interaction with it and provide the rest of the APIs via properties, methods and events directly with the DOM instance.

## Properties

| Property  | Type      | Description |
|-----------|-----------|-------------|
| `isEmpty` | `boolean` | `true` when the signature surface is empty, otherwise `false` |

## Methods

| Signature                          | Description |
|------------------------------------|-------------|
| `clear()`                          | clears the signature surface |
| `toSvg(options: ExportOptions)`    | exports the signature as SVG (full SVG text) |
| `toCanvas(options: ExportOptions)` | exports the signature as `canvas` element |

### `ExportOptions`
| Property     | Type      | Default       | Descriptions |
|--------------|-----------|---------------|--------------|
| `trim`       | `boolean` | `false`       | when `true`, the exported image will have trimmed the white space around the actual signature drawing |
| `color`      | `string`  | `#000`        | standard CSS color (hex / rgba) to be used as ink of the exported signature |
| `background` | `string`  | `transparent` | standard CSS color (hex / rgba) to be used as background fill of the exported image |

> Note: if JPEG format is your end target, use colored `background` (eg `#fff`), since `transparent` is not supported by JPEG and will result in a black fill.

## Events

| Event    | Description |
|----------|-------------|
| `change` | fired each time the signature surface gets updated (new drawing or cleared) |