/// <reference types="svelte" />
import { mount } from "svelte";

/**
 * Defines the function signature of all single-spa's lifecycle functions.
 * @param props Properties object coming from the `single-spa` library.
 */
export type LifecycleFunction = (sspaProps: SingleSpaProps) => Promise<any>;

/**
 * Defines the function signature of the domElementGetter function.
 * @param props Properties object coming from the `single-spa` library.
 * @returns The HTML element where the micro-frontend or parcel will be mounted into.
 */
export type DomElementGetterFunction = (props: SingleSpaProps) => HTMLElement;

/**
 * Defines the single-spa lifecycle functions.
 */
export type SspaLifeCycles<TProps extends Record<string, any> = Record<string, any>> = {
    /**
     * Bootstrapping function that is called once by `single-spa`.
     */
    bootstrap: LifecycleFunction;
    /**
     * Mounts the micro-frontend or parcel.
     */
    mount: LifecycleFunction;
    /**
     * Unmounts the micro-frontend or parcel.
     */
    unmount: LifecycleFunction;
    /**
     * Updates the properties passed to the parcel.
     * @param props Updated set of properties for the parcel.
     * @returns A promise that resolves once the update has completed.
     */
    update: (props: TProps) => Promise<void>;
};

/**
 * Defines the single-spa parcel object.
 */
type Parcel<TProps extends Record<string, any> = Record<string, any>> = {
    /**
     * Mounts the parcel.
     */
    mount(): Promise<null>;
    /**
     * Unmounts the parcel.
     */
    unmount(): Promise<null>;
    /**
     * Update the parcel's properties.
     * @param customProps Properties for the parcel.
     */
    update?(customProps: TProps): Promise<any>;
    /**
     * Obtains the parcel's current status.
     */
    getStatus():
        | "NOT_LOADED"
        | "LOADING_SOURCE_CODE"
        | "NOT_BOOTSTRAPPED"
        | "BOOTSTRAPPING"
        | "NOT_MOUNTED"
        | "MOUNTING"
        | "MOUNTED"
        | "UPDATING"
        | "UNMOUNTING"
        | "UNLOADING"
        | "SKIP_BECAUSE_BROKEN"
        | "LOAD_ERROR";
    /**
     * Load promise.
     */
    loadPromise: Promise<null>;
    /**
     * Bootstrap promise.
     */
    bootstrapPromise: Promise<null>;
    /**
     * Mount promise.
     */
    mountPromise: Promise<null>;
    /**
     * Unmount promise.
     */
    unmountPromise: Promise<null>;
};

/**
* Defines the call signature of the `mountParcel` function.
* @param config `single-spa` configuration object, or a function that returns a promise for said object.
* @param props Properties that will be passed to the parcel on mounting.
* @returns The `single-spa` parcel object.
*/
export type MountParcelFn<TProps extends Record<string, any> = Record<string, any>> = (
    config: SspaLifeCycles | (() => Promise<SspaLifeCycles>),
    props: TProps & { domElement: HTMLElement },
) => Parcel<TProps>;

/**
 * Defines the contents of the `single-spa` library.
 * 
 * This should come from the `single-spa` package itself, so this type is a mere placeholder.
 */
export type SingleSpaLibrary = Record<string, any>;

/**
 * Defines the properties that every micro-frontend and parcel receive from `single-spa`.
 */
export type InheritedSingleSpaProps = {
    /**
     * Micro-frontend or parcel name.
     */
    name: string;
    /**
     * The complete `single-spa` library instance.
     */
    singleSpa: SingleSpaLibrary;
    /**
     * Mounts a parcel instance in the `domElement` HTML element provided through the `props` parameter.
     */
    mountParcel: MountParcelFn;
}

/**
 * Defines the properties that single-spa inject to every mounted component.
 */
export type SingleSpaProps = InheritedSingleSpaProps & Record<string, any> & {
    /**
     * HTML element where the `single-spa` parcel is mounted.
     * 
     * **NOTE**:  Techincally speaking, micro-frontends could be mounted using this, but it goes against the 
     * `single-spa` guidelines and this information is undocumented API and therefore subject to change without prior 
     * notice.
     */
    domElement?: HTMLElement;
    /**
     * Function that returns an HTML element where to mount the micro-frontend.  It is set in the call to 
     * `single-spa`'s `registerApplication()` function.
     */
    domElementGetter?: DomElementGetterFunction;
};

/**
 * Options for Svelte's `mount()` function.
 */
export type SvelteOptions<
    TProps extends Record<string, any> = Record<string, any>,
    TExports extends Record<string, any> = Record<string, any>
> = Omit<Parameters<typeof mount<TProps, TExports>>['1'], 'target'>;

/**
 * Options given to the lifecycle-creation function.
 */
export type LifecycleOptions<
    TProps extends Record<string, any> = Record<string, any>,
    TExports extends Record<string, any> = Record<string, any>
> = {
    /**
     * Optional function to be run immediately before Svelte mounts the component.
     * 
     * An error thrown from this function will make the mount promise to reject.
     * @param target HTML element where the Svelte component will be mounted in.
     */
    preMount?: (target: HTMLElement) => Promise<void> | void;
    /**
     * Optional function to be run immediately after Svelte unmounts the component.
     * 
     * An error thrown from this function will make the unmount promise to reject.
     * @param target HTML element where the Svelte component was mounted in.
     */
    postUnmount?: (target: HTMLElement) => Promise<void> | void;
    /**
     * Optional options for Svelte's `mount()` function.
     */
    svelteOptions?: SvelteOptions<TProps, TExports>;
};

/**
 * Defines the shape of the context stored at the level of the root component (the component mounted via the 
 * `singleSpaSvelte()` function).
 */
export type SingleSpaContext = {
    /**
     * The complete `single-spa` library instance.
     */
    library: SingleSpaLibrary;
    /**
     * The parcel-mounting function assigned to the micro-frontend.
     */
    mountParcel: MountParcelFn;
};
