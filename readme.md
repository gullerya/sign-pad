[![npm](https://img.shields.io/npm/v/sign-pad.svg?label=npm%20sign-pad)](https://www.npmjs.com/package/sign-pad)
[![GitHub](https://img.shields.io/github/license/gullerya/sign-pad.svg)](https://github.com/gullerya/sign-pad)

[![Quality pipeline](https://github.com/gullerya/sign-pad/actions/workflows/quality.yml/badge.svg)](https://github.com/gullerya/sign-pad/actions/workflows/quality.yml)
[![Codecov](https://img.shields.io/codecov/c/github/gullerya/sign-pad/main.svg)](https://codecov.io/gh/gullerya/sign-pad/branch/main)
[![Codacy](https://img.shields.io/codacy/grade/375f658061bf4150b8a9125b5fe460ae.svg?logo=codacy)](https://app.codacy.com/gh/gullerya/sign-pad/dashboard)

# Summary

`sign-pad` web component provides signature drawing surface and related services, featured by:
- smooth drawing experience
- customizable background
- A11Y:
	- `sign-pad` is focusable
	- `Enter` key 'commits' the change, if any (focusing out and firing `change` event if changed)
	- `Escape` key clears the signature
- convenient export API:
	- export as **SVG** or **canvas**
	- opt-in **trim** whitespace around the signature if needed
	- configurable **ink** and **fill** (background) of the exported image
- convenient interop API:
	- **empty** state reflected as property and attribute (for easy state-based styling and logic)
	- `input` event fired upon each signature drawing touch (including clear)
	- `change` event fired when the `sign-pad` looses focus if the content has been changed since it gained it

Here is a snapshot of a simple example of `sign-pad` usage in [this CodePen](https://codepen.io/gullerya/pen/ZEBbGeO):

<img src="docs/images/example.png" alt="sign-pad example" width="240px"/>

> Note: in the example above `sign-pad` is only the signature drawing surface; shadows, buttons and the image reflection are parts of the demo code.

# Usage example

Example below shows an essense of `sign-pad` usage: initializaion, HTML, state-based styling and JS logic.

Staring with HTML/CSS:
```html
<sign-pad class="pad"></sign-pad>

<style>
	.pad[empty] {
		outline: 2px solid red;
	}
</style>
```

Now to the logic:

```js
import 'sign-pad.min.js';

const pad = document.querySelector('.pad');

//	rest of the APIs are available via the instance:
pad.addEventListener('input', e => {});

const asSvg = pad.export('svg', { trim: true, ink: 'blue' });
const asJpg = pad.export('jpg', { ink: 'white', fill: 'black' });
const asPng = pad.export('png');
```

# Install

Use regular `npm install sign-pad --save-prod` to use the component from your local environment.

Additionally, a **CDN** deployment available (AWS driven), so one can import the component directly:
```js
import 'https://libs.gullerya.com/sign-pad/x.y.z/sign-pad.min.js';
```

> Note: replace the `x.y.z` by the desired version, one of the listed in the [changelog](docs/changelog.md).

CDN features:
- HTTPS only, no untrusted man-in-the-middle
- highly available (with many geo spread edges)
- agressive caching setup

# API

Full API documentation found [here](docs/api.md).

# Changelog

Full changelog found [here](docs/changelog.md).
