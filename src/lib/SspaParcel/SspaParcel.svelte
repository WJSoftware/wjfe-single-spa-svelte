<script lang="ts">
    import type { MountParcelFn, Parcel } from "$lib/wjfe-single-spa-svelte.js";

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
             * The mountParcel function to use to mount the parcel.  Pass the function received from single-spa if 
             * available; otherwise you may use single-spa's mountRootParcel function.
             */
            mountParcel: MountParcelFn;
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
    const initialProps = { ...restProps };

    $effect(() => {
        if (parcel) {
            return;
        }
        parcel = sspa.mountParcel(sspa.config, {
            domElement: containerEl,
            ...initialProps,
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
        // For reasons yet unknown, the effect is not re-run unless the rest props are spreaded into this variable.
        const newProps = { ...restProps };
        parcel?.update?.(newProps);
        // parcel?.update?.({ ...restProps });
    });
</script>

<!--
@component

The `SspaParcel` Svelte component can be used to embed `single-spa` parcel components.  Parcel components can be 
written using any framework or library (React, Vue, Svelte, Lit, HTMX, etc.) as long as the final result is a module 
that exports the parcel lifecycle functions.

Refer to [this topic](https://single-spa.js.org/docs/parcels-overview) in the `single-spa` documentation for detailed 
information.

## The `sspa` Prop

This must be an object with the two required pieces of information:  The `mountParcel` function to use when mounting 
the parcel, and the parcel configuration object (the object with the lifecycle functions).  The latter can also be a 
function that returns a promise with said configuration object.

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

Mounting a parcel with no custom (or parcel-native) properties:

```html
<SspaParcel sspa={{ mountParcel, config: loadParcel }} />
```

Mounting a parcel with extra properties that are native to the parcel being mounted:

```html
<SspaParcel sspa={{ mountParcel, config: loadParcel }} showSomething={true} onclick={() => console.log('clicked!')} />
```

As seen in the above examples, event handlers can be passed as well thanks to Svelte v5's new design.  Yes, snippets 
can also be passed along as props.
-->

<div bind:this={containerEl}></div>

<style>
    div {
        display: contents;
    }
</style>
