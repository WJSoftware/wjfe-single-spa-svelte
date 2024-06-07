<script lang="ts" generics="TProps extends Record<string, any>">
    import { mountRootParcel, type LifeCycles, type Parcel } from 'single-spa';

    let {
        sspa,
        ...restProps
    }: TProps & {
        sspa: {
            mountParcel: typeof mountRootParcel;
            loaderFn: () => Promise<LifeCycles>;
        };
    } & Record<string, any> = $props();

    let containerEl: HTMLDivElement;
    let parcel: Parcel | undefined;
    const initialProps = { ...restProps };

    $effect(() => {
        if (parcel) {
            console.debug('Parcel-creating effect ran after parcel was created.');
            return;
        }
        console.debug('Creating parcel.');
        parcel = sspa.mountParcel(sspa.loaderFn, {
            domElement: containerEl,
            ...initialProps,
            // ...restProps
        });
        // return async () => {
        //     await parcel?.bootstrapPromise;
        //     await parcel?.mountPromise;
        //     await parcel?.unmount();
        //     parcel = undefined;
        //     console.debug('Parcel unmounted.');
        // };
    });

    $effect(() => {
        console.debug('Parcel props changed!!! %o %o', parcel, { ...restProps });
        parcel?.update?.({ ...restProps });
    });
</script>

<div bind:this="{containerEl}"></div>

<style>
    div {
        display: contents;
    }
</style>
