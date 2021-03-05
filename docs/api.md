# API

`sign-pad` is a fully featured web-component.

## `sign-pad` component

Do import `sign-pad` web component to have it initialized in the custom elements registry:
```js
import 'sign-pad.js';
```

Having that, use the component directly in HTML:
```html
<sign-pad></sign-pad>
```

`sign-pad` will render a drawing surface, track user interactions with it and provide the rest of the APIs via properties, methods and events directly with the DOM instance.

## Visual customization

`sign-pad` provides visual customizations via slots, classes and CSS variables.

### Slots

| Slot name    | Description |
|--------------|-------------|
| `background` | slotted `background`, if any, will be shown beneath the signature drawing surface, useful to show visual hints like directing base line etc |

## Attributes/Properties

| Attribute | Property  | Type      | Description |
|-----------|-----------|-----------|-------------|
| `empty`   | `empty`   | `boolean` | `true` (attribute present) when the signature surface is empty, otherwise `false` (attribute absent) |

## Methods

| Signature                 | Description |
|---------------------------|-------------|
| `clear()`                 | clears the signature surface |
| `export(format, options)` | exports the signature as per format and options, see below for further info |

### Formats:
|          |           |
|----------|-----------|
| `svg`    | exports signature drawing as `SVGElement`, which can be further operated on or just stored as ready to use one (the whole content is availbale via `outerHTML` property, for example) |
| `canvas` | exports signature drawing as `HTMLCanvasElement`, which can be further operated on (see `toBlob` and `toDataURL` methods documentation) |

### Options:
| Property | Type      | Default       | Descriptions |
|----------|-----------|---------------|--------------|
| `trim`   | `boolean` | `false`       | when `true`, the exported image will have trimmed the white space around the actual signature drawing |
| `ink`    | `string`  | `#000`        | standard CSS color (hex / rgba) to be used as the ink of the exported signature |
| `fill`   | `string`  | `transparent` | standard CSS color (hex / rgba) to be used as the background fill of the exported image |

> Note: if JPEG format is your end target, use colored `fill` (eg `#fff`), since `transparent` is not supported by JPEG and will result in a black fill.

## Events

| Event   | Description |
|---------|-------------|
| `input` | fired each time the signature surface gets updated (new drawing or cleared) |