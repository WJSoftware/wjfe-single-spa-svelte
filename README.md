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

const lcc = singeSpaSvelte(App /*, domElementGetter, { options } */);

export const bootstrap = lcc.bootstrap;
export const mount = lcc.mount;
export const unmount = lcc.unmount;
export const update = lcc.update;
```

## Migrating from Svelte v4

As seen in the previous code snippet, it is almost identical.  The differences are in the arguments passed to the 
function.  The NPM package from the `single-spa` team receives a single argument, while this version can receive up to 
three arguments.

Before (`single-spa-svelte` package from the `single-spa` team):

```typescript
import singleSpaSvelte from 'single-spa-svelte';

const lcc = singleSpaSvelte({
    component: App
});
```

With this package, the export is not default, and the component is not part of the options.  Other than this, the 
resulting functions should be conformant to what you are used to with `single-spa`.

## The Options Parameter

> Since **v0.4.0**

As seen in the Quickstart, `singleSpaSvelte`'s third parameter is named "options".  It accepts 3 properties:

+ `preMount`:  Optional function that is run just before mounting the Svelte component.
+ `postUnmount`:  Optionsl function that is run immediately after unmounting the Svelte component.
+ `mountOptions`:  Optional set of options for Svelte's `mount` function.

For details on the last one, refer to Svelte's documentation.  All properties are accepted, except for `target`.

The other two are optional functions that receive as only argument the target HTML element where the component will be 
mounted in (or it was mounted in).  This is useful if you need to manipulate this element in any way.  The use case that gave birth to this feature was to add CSS classes to the element, which need to be removed upon unmounting:

```typescript
const lcc = singeSpaSvelte(App , undefined, {
    preMount: (target) => target.classList.add('flex-fill'),
    postUnmount: (target) => target.classList.remove('flex-fill'),
});
```

The `target` parameter is guaranteed to be defined.

## The SspaParcel Component

This package also provides a `SspaParcel` component that should help Svelters out there to consume `single-spa` 
parcels in Svelte v5 projects.  It works quite similarly to `<svelte:component>`, where the component is placed in 
markup and then via props, the component and its properties are set.

```html
<SspaParcel sspa={{ config: parcelConfig }} {...restOfParcelProperties} />
```

You can collect the parcel properties in an object and then spread them as in the example above, or you may 
individually specify them in markup as it is normally done with other components.

### The sspa Property

For a `single-spa` parcel to be successfully mounted using `SspaParcel`, the parcel configuration object or a function 
that returns it must be provided.  The purpose of the `sspa` property is to allow passing this requirement.

The `sspa` property is an object in order to avoid reserving property names that may collide with the property names of 
the parcel component being mounted.  It only has one property:  `sspa.config`.  In the future and if required, any 
new properties will be defined inside this `sspa` object property that serves as namespace.

> [!IMPORTANT]
> It is recommended to implement the factory pattern for the lifecycle functions when it comes to parcels.  See this 
> [GitHub issue](https://github.com/single-spa/single-spa-svelte/issues/28) opened for the Svelte v4 version of this 
> package for details on how to implement a factory function.

## The single-spa Context

> Since **v0.5.0**

The entire `single-spa` library instance and the `mountParcel` function are available via context.  If needed, import  
`getSingleSpaContext` and call it to obtain the context.  Remember to use this function in the initialization code of a 
component.

### Setting the single-spa Context

> Since **v0.7.0**

It is also possible to set the needed context for the `SspaParcel` component from root Svelte projects.  Before this 
was possible, the `SspaParcel` component would not work on root projects because it was unable to get a hold of the 
needed `mountParcel` function.

> [!NOTE]
> This is only needed on root projects that wish to mount parcels with the `SspaParcel` component.  Micro-frontends get 
> this done automatically.

```typescript
import * as singleSpaLib from "single-spa";
import { setSingleSpaContext } from "@wjfe/single-spa-svelte";

setSingleSpaContext({ library: singleSpaLib });
```
