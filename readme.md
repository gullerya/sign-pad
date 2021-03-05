[![npm](https://img.shields.io/npm/v/sign-pad.svg?label=npm%20sign-pad)](https://www.npmjs.com/package/sign-pad)
[![GitHub](https://img.shields.io/github/license/gullerya/sign-pad.svg)](https://github.com/gullerya/sign-pad)

[![Quality pipeline](https://github.com/gullerya/sign-pad/workflows/Quality%20pipeline/badge.svg?branch=master)](https://github.com/gullerya/sign-pad/actions?query=workflow%3A%22Quality+pipeline%22)
[![Codecov](https://img.shields.io/codecov/c/github/gullerya/sign-pad/master.svg)](https://codecov.io/gh/gullerya/sign-pad/branch/master)
[![Codacy](https://img.shields.io/codacy/grade/375f658061bf4150b8a9125b5fe460ae.svg?logo=codacy)](https://www.codacy.com/app/gullerya/sign-pad)

# Summary

`sign-pad` delivers a web component, providing signature drawing surface and related services:
- smooth drawing experience
- customizable background
- convenient export API:
	- export as **SVG** or **canvas**
	- opt-in **trim** whitespace around the signature if needed
	- configurable **ink** and **fill** (background) of the exported image

# Usage example

Exmple below shows a full example of `sign-pad` usage: initiation, HTML, some styling to reflect focuses interaction and image extracton.

```js
import 'sign-pad';
```

# API

`sign-pad` functionality exposed as the fully-featured web-component, via the properties, methods and events of an actual DOM instance.

Full API documentation found [here](./docs/api.md).