import { getContext } from "svelte";
import type { SingleSpaContext } from "./wjfe-single-spa-svelte.js";

/**
 * Defines the context key used to store single-spa's `mountParcel()` function.
 */
export const singleSpaContextKey = Symbol("mountParcel");

/**
 * Obtains the `single-spa` context, which is an object that contains the `single-spa` library instance and the 
 * `mountParcel` function for the micro-frontend.
 * @returns The stored `single-spa` context.
 */
export function getSingleSpaContext() {
    return getContext<SingleSpaContext>(singleSpaContextKey);
};
