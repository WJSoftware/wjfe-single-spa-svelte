<script lang="ts" generics="TProps extends Record<string, any> = Record<string, any>">
    import { getSingleSpaContext } from "$lib/singleSpaContext.js";
    import type { Parcel, SspaParcelConfig } from "$lib/wjfe-single-spa-svelte.js";
    import { onMount } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    let {
        sspa,
        ...restProps
    }: TProps & {
        /**
         * Required property object.  Allows the specification on the parcel to mount and the function to use to mount 
         * it.
         */
        sspa: {
            /**
             * Parcel configuration object, or a function that returns a promise with the configuration object.
             */
            config: SspaParcelConfig<TProps>;
            /**
             * Optional properties to apply to the container DIV.  This is useful for adding event handlers to the
             * container, or maybe even styling it.
             */
            containerProps?: HTMLAttributes<HTMLDivElement>;
        };
    } = $props();

    if (!sspa?.config) {
        throw new Error('Cannot render parcel because no configuration was provided.');
    }

    let containerEl: HTMLDivElement;
    let parcel: Parcel | undefined;
    let firstRun = true;

    onMount(() => {
        // The needed mountParcel() function from context.
        const ctx = getSingleSpaContext();
        const mountParcelFn = ctx?.mountParcel ?? ctx?.library?.mountRootParcel;
        if (typeof mountParcelFn !== 'function') {
            throw new Error('Unexpected:  The single-spa context did not carry the "mountParcel" function.');
        }
        parcel = mountParcelFn(sspa.config as SspaParcelConfig, {
            domElement: containerEl,
            ...restProps,
        });
        return async () => {
            if (parcel && parcel.getStatus() !== 'MOUNTED') {
                return;
            }
            await parcel?.unmount();
            parcel = undefined;
        };
    });

    $effect(() => {
        // Must be the first line so the dependency on restProps is tracked.
        const newProps = { ...restProps };
        if (firstRun) {
            firstRun = false;
            return;
        }
        parcel?.mountPromise.then(() => {
            parcel!.update?.(newProps);
        });
    });
</script>

<div bind:this={containerEl} {...sspa.containerProps}></div>

<style>
    div {
        display: contents;
    }
</style>

<!--
@component

# SspaParcel

The `SspaParcel` Svelte component can be used to embed `single-spa` parcel components.  Parcel components can be 
written using any framework or library (React, Vue, Svelte, Lit, HTMX, etc.) as long as the final result is a module 
that exports the parcel lifecycle functions.

Refer to [this topic](https://single-spa.js.org/docs/parcels-overview) in the `single-spa` documentation for detailed 
information.

## The `sspa` Prop

This must be an object with one required property:  The parcel configuration object (the object with the lifecycle 
functions).  This can also be a function that returns a promise for said configuration object.

The other property, `containerProps`, is an optional object that contains properties to apply to the container DIV.  This 
is useful for adding event handlers to the container, or even styling it.  See the last example for more information.

> You could also opt to style the container DIV, but know this DIV has a class that applies the `display: contents;` 
> style to it.  In order to style it, you must apply a different value for the `display` CSS property.  The property 
> is applied with a specificity of (0, 1, 1), so your style must be at least that specific.

## Examples

> NOTE: See [this issue](https://github.com/single-spa/single-spa-svelte/issues/28) to understand why exporting 
> factory functions is beneficial as opposed to simply exposing the lifecycle functions directly.

```typescript
function loadParcel() {
    const parcelModule = await import('https://my.parcel.example.com/parcel.js');
    // This assumes exporting a function that creates the lifecycle object.  See the above note.
    return await parcelModule.createParcel();
}
```

### Mounting a parcel with no custom (or parcel-native) properties

```html
<SspaParcel sspa={{ config: loadParcel }} />
```

### Mounting a parcel with extra properties that are native to the parcel being mounted

```html
<SspaParcel sspa={{ config: loadParcel }} showSomething={true} onclick={() => console.log('clicked!')} />
```

As seen in the above examples, event handlers can be passed as well thanks to Svelte v5's new design.

### Typing `loadParcel` to obtain Intellisense on props

For the previous example with properties, you can attain Intellisense on the properties by typing the `loadParcel` 
function.  This is done by defining the `ParcelProps` type and using it as the generic type for the `SspaParcelConfigObject` 
type.

```typescript
import type { SspaParcelConfigObject } from '@wjfe/single-spa-svelte';

type ParcelProps = {
    showSomething: boolean;
    onclick: () => void;
};

function loadParcel(): Promise<SspaParcelConfigObject<ParcelProps>> {
    const parcelModule = await import('https://my.parcel.example.com/parcel.js');
    // This assumes exporting a function that creates the lifecycle object.  See the above note.
    return await parcelModule.createParcel();
}
```

Doing this will allow you to have Intellisense on the `SspaParcel` component as you type its properties.

### Passing Properties to the Container DIV

```html
<SspaParcel sspa={{
    config: loadParcel,
    configProps: {
        onfocusin: (e) => console.log('Parcel has the focus.', e)
    }
}} />
```

The container DIV has the `display: contents;` style applied to it with specificity (0, 1, 1).  If you would like to 
change it, pass `configProps.class` with a class name that overrides this value (at least the same specificity).

-->
