/// <reference types="svelte" />
import { mount } from "svelte";

/**
 * Defines the function signature of all single-spa's lifecycle functions.
 * @param props Properties object coming from the `single-spa` library.
 */
export type LifecycleFunction = (sspaProps: SingleSpaProps) => Promise<void> | undefined;

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
 * Defines the properties that every micro-frontend and parcel receive from `single-spa`.
 */
export type InheritedSingleSpaProps = {
    /**
     * Micro-frontend or parcel name.
     */
    name: string;
    /**
     * The entire `single-spa` library.
     */
    singleSpa: Record<string, any>;
    /**
     * Mounts a parcel instance in the `domElement` HTML element provided through the `props` parameter.
     * @param config `single-spa` configuration object, or a function that returns a promise for said object.
     * @param props Properties that will be passed to the parcel on mounting.
     * @returns The `single-spa` parcel object.
     */
    mountParcel: (
        config: SspaLifeCycles | (() => Promise<SspaLifeCycles>),
        props: Record<string, any> & { domElement: HTMLElement },
    ) => any;
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
 * Svelte options for Svelte's `mount()` function.
 */
export type SvelteOptions<
    TProps extends Record<string, any> = Record<string, any>,
    TExports extends Record<string, any> = Record<string, any>
> = Omit<Parameters<typeof mount<TProps, TExports>>['1'], 'target'>;
