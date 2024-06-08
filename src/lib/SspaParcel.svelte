<script lang="ts">
    import { mountRootParcel, type LifeCycles, type Parcel } from 'single-spa';

    let {
        sspa,
        ...restProps
    }: Record<string, any> & {
        sspa: {
            mountParcel: typeof mountRootParcel;
            loaderFn: () => Promise<LifeCycles>;
        };
    } = $props();

    let containerEl: HTMLDivElement;
    let parcel: Parcel | undefined;
    const initialProps = { ...restProps };

    $effect(() => {
        if (parcel) {
            return;
        }
        parcel = sspa.mountParcel(sspa.loaderFn, {
            domElement: containerEl,
            ...initialProps,
            // ...restProps
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
        // console.log('Effect!');
        // parcel?.update?.({ ...restProps });
    });
</script>

<div bind:this={containerEl}></div>

<style>
    div {
        display: contents;
    }
</style>
