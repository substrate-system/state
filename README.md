# state
[![tests](https://img.shields.io/github/actions/workflow/status/substrate-system/state/nodejs.yml?style=flat-square)](https://github.com/substrate-system/state/actions/workflows/nodejs.yml)
[![types](https://img.shields.io/npm/types/@substrate-system/state?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](./CHANGELOG.md)
[![install size](https://flat.badgen.net/packagephobia/install/@substrate-system/state)](https://packagephobia.com/result?p=@substrate-system/state)
[![gzip size](https://flat.badgen.net/bundlephobia/minzip/@substrate-system/routes)](https://bundlephobia.com/package/@substrate-system/state)
[![license](https://img.shields.io/badge/license-Big_Time-blue?style=flat-square)](LICENSE)


Helpful pieces for application state.

<details><summary><h2>Contents</h2></summary>
<!-- toc -->
</details>

## Install

```sh
npm i -S @substrate-system/package
```

## Example

### TS

```ts
import { type HTTPError } from 'ky'
import {
    type RequestFor,
    RequestState
} from '@substrate-system/state'

const { start, set, error } = RequestState

const myRequest = ReqestState<string, HTTPError>(null)
// { data: null, error: null, pending: false }

start(myRequest)
// { data: null, error: null, pending: true }

set(myRequest, 'abc')
// { data: 'abc', error: null, pending: false }

error(myRequest, new Error('ok'))
// { data: 'abc', error: Error, pending: false }
```


## Modules

This exposes ESM and common JS via
[package.json `exports` field](https://nodejs.org/api/packages.html#exports).

### ESM
```js
import {
    type RequestFor,
    RequestState
} '@substrate-system/state'
```

### Common JS
```js
require('@substrate-system/package/module')
```

### pre-built JS

This package exposes minified JS files too. Copy them to a location that is
accessible to your web server, then link to them in HTML.

#### copy
```sh
cp ./node_modules/@substrate-system/state/dist/index.min.js ./public/state.min.js
```

#### HTML
```html
<script type="module" src="./state.min.js"></script>
```
