<script lang="ts">
    import { getSingleSpaContext } from "$lib/singleSpaContext.js";
    import type { MountParcelFn, Parcel } from "$lib/wjfe-single-spa-svelte.js";
    import { onMount } from "svelte";

    let {
        sspa,
        ...restProps
    }: Record<string, any> & {
        /**
         * Required property object.  Allows the specification on the parcel to mount and the function to use to mount 
         * it.
         */
        sspa: {
            /**
             * Parcel configuration object, or a function that returns a promise with the configuration object.
             */
            config: Parameters<MountParcelFn>[0];
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
        const mountParcelFn = getSingleSpaContext()?.mountParcel;
        if (typeof mountParcelFn !== 'function') {
            throw new Error('Unexpected:  The single-spa context did not carry the "mountParcel" function.');
        }
        parcel = mountParcelFn(sspa.config, {
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

<div bind:this={containerEl}></div>

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
functions).  This can also be a function that returns a promise with said configuration object.

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

As seen in the above examples, event handlers can be passed as well thanks to Svelte v5's new design.  Yes, snippets 
can also be passed along as props.
-->
