# API

TODO: general description

## `sign-pad` component

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

## Events

TODO: should have event on signature change

| Event    | Description |
|----------|-------------|
| `change` | fired each time the signature surface gets updated (new drawing or cleared) |