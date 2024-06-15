// Reexport your entry components here
export * from './SspaParcel.svelte';
export { default as SspaParcel } from './SspaParcel.svelte';
export * from './single-spa.svelte.js';
import singleSpaSvelteFactory from './single-spa.svelte.js';

/**
 * Creates single-spa lifecycle functions for a Svelte v5 component.
 * @param component Svelte component to mount as a single-spa micro-frontend or parcel.
 * @param domElementGetter Optional function that returns the DOM element where the component is mounted.
 * @param svelteOptions Optional set of Svelte options for mounting.  Refer to Svelte's `mount()` function 
 * documentation for information about each option.
 * @returns An object containing the single-spa lifecycle functions for the component.
*/
export const singleSpaSvelte = singleSpaSvelteFactory();
