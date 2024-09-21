import { setContext } from "svelte";
import { singleSpaContextKey } from "./singleSpaContext.js";
import type { MountParcelFn } from "./wjfe-single-spa-svelte.js";

export function delay(timeout?: number) {
    return new Promise<void>((rs) => setTimeout(() => rs(), timeout));
}

/**
 * Sets the special `"mountParcel"` context using the provided function as its value.
 * 
 * This is not needed in mounted micro-frontends because the context is automatically set when the micro-frontend's 
 * root component is mounted.  This is only needed in root projects that mount parcels directly using `SspaParcel`.
 * 
 * @example
 * ```html
 * <script lang="ts">
 *     import { mountRootParcel } from "single-spa";
 * 
 *     // Call the function during the root component's initialization phase.
 *     setMountParcelContext(mountRootParcel);
 * </script>
 * ```
 * @param mountParcelFn Either single-spa's `mountRootParcel()` function, or an equivalent parcel-mounting function.
 */
export function setMounParcelContext(mountParcelFn: MountParcelFn) {
    setContext(singleSpaContextKey, mountParcelFn);
}
