# @wjfe/single-spa-svelte

> NPM package capable of creating single-spa lifecycle functions for Svelte v5 components.

Svelte v5 is fundamentally different to previous versions.  Pertaining the functionality found in the equivalent 
package from the `single-spa` team, the relevant changes are:

1. Components are no longer classes.  Instantiation of components now require the use of the `mount()` function from 
Svelte.
2. Unmounting components is no longer done with the component's `$destroy()` method and instead it requires the use of 
the `unmount()` function from Svelte.
3. Component properties are no longer updated with `$set()` and instead the props object is reactive state built with 
the `$state()` rune.

## Quickstart

Install the NPM package:

```bash
npm i @wjfe/single-spa-svelte
```

Now use it to create lifecycle functions, almost as with the v4 version from the `single-spa` team:

```typescript
import { singleSpaSvelte } from '@wjfe/single-spa-svelte';
import App from './App.svelte';

const lcc = singeSpaSvelte(App /*, domElementGetter, { <Svelte's mount() options> } */);

export const bootstrap = lcc.bootstrap;
export const mount = lcc.mount;
export const unmount = lcc.unmount;
```

## Migrating from Svelte v4

As seen in the previous code snippet, it is almost identical.  The differences are in the arguments passed to the 
function.  The NPM package from the `single-spa` team receives a single argument, while this version can receive up to 
three arguments.  This makes coding easier because there is no cleaning up/separation of properties to be done.

Before:

```typescript
import singleSpaSvelte from 'single-spa-svelte';

const lcc = singleSpaSvelte({
    component: App
});
```

With this package, the export is not default, and the component is not part of the options.  Other than this, the 
resulting functions should be conformant to what you are used to with `single-spa`.

## The Parcel Component

This package also provides a `Parcel` component that should help Svelters out there to consume `single-spa` parcels in 
Svelte v5 projects.
