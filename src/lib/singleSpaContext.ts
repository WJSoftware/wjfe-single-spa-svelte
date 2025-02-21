import { getContext, setContext } from "svelte";
import type { SingleSpaContext } from "./wjfe-single-spa-svelte.js";

/**
 * Defines the context key used to store single-spa's `mountParcel()` function and the library instance.
 */
export const singleSpaContextKey = Symbol("singleSpaSvelte");

/**
 * Obtains the `single-spa` context, which is an object that contains the `single-spa` library instance and the 
 * `mountParcel` function for the micro-frontend/parcel.
 * @returns The stored `single-spa` context.
 */
export function getSingleSpaContext() {
    return getContext<SingleSpaContext>(singleSpaContextKey);
};

/**
 * Sets the `single-spa` context, which is an object that contains the `single-spa` library instance and the 
 * `mountParcel` function for the micro-frontend/parcel.
 * @param context The `single-spa` context to store.
 */
export function setSingleSpaContext(context: SingleSpaContext) {
    setContext<SingleSpaContext>(singleSpaContextKey, context);
}
