import { mount, unmount } from "svelte";
import { type Component } from "svelte";
import type { DomElementGetterFunction, InheritedSingleSpaProps, SingleSpaProps, SspaLifeCycles, SvelteOptions } from "./wjfe-single-spa-svelte.js";

/**
 * Class used to track single-spa instances.
 */
class SvelteLifeCycle<
    TProps extends Record<string, any> = Record<string, any>
>
{
    #instance?: object;
    props = $state<TProps & InheritedSingleSpaProps>({} as TProps & InheritedSingleSpaProps);

    constructor() {
        this.#instance = undefined;
    }

    get instance() {
        return this.#instance;
    }
    set instance(newInstance) {
        this.#instance = newInstance;
    }
}

/**
 * Creates single-spa lifecycle functions for a Svelte v5 component.
 * @param component Svelte component to mount as a single-spa micro-frontend or parcel.
 * @param domElementGetter Optional function that returns the DOM element where the component is mounted.
 * @param svelteOptions Optional set of Svelte options for mounting.  Refer to Svelte's `mount()` function 
 * documentation for information about each option.
 * @returns An object containing the single-spa lifecycle functions for the component.
 */
function singleSpaSvelte<TProps extends Record<string, any> = Record<string, any>>(
    component: Component<TProps>,
    domElementGetter?: DomElementGetterFunction,
    svelteOptions?: SvelteOptions<TProps>
): SspaLifeCycles<TProps> {
    const thisValue = new SvelteLifeCycle<TProps>();

    function mountComponent(this: SvelteLifeCycle<TProps>, props: SingleSpaProps) {
        const mergedProps = {
            ...svelteOptions?.props,
            ...props
        };
        delete mergedProps.domElement;
        delete mergedProps.domElementGetter;
        for (let [k, v] of Object.entries(mergedProps)) {
            // Due to the mixture of things single-spa does, this is not possible to type properly.  At least I can't.
            // @ts-ignore
            this.props[k] = v;
        }
        const target = chooseDomElementGetter(props, domElementGetter)();
        this.instance = mount(component, { ...svelteOptions, target, props: this.props });
        return Promise.resolve();
    }

    function unmountComponent(this: SvelteLifeCycle, props: SingleSpaProps) {
        if (!this.instance) {
            throw new Error('Cannot unmount.  There is no component to unmount.');
        }
        unmount(this.instance);
        this.instance = undefined;
        return Promise.resolve();
    }

    function updateComponent(this: SvelteLifeCycle, newProps: TProps) {
        for (let [k, v] of Object.entries(newProps)) {
            this.props[k] = v;
        }
        return Promise.resolve();
    }

    return {
        bootstrap: () => Promise.resolve(),
        mount: mountComponent.bind(thisValue),
        unmount: unmountComponent.bind(thisValue),
        update: updateComponent.bind(thisValue)
    };
}

function chooseDomElementGetter(
    sspaProps: SingleSpaProps,
    domElementGetter?: DomElementGetterFunction
): () => HTMLElement {
    // This one is for parcel mounting.
    if (sspaProps.domElement) {
        return () => sspaProps.domElement!;
    }
    // This one may come from customProps (registerApplication).
    if (sspaProps.domElementGetter) {
        return () => sspaProps.domElementGetter!(sspaProps);
    }
    // This is the one coming from the call to singleSpaSvelte:
    if (domElementGetter) {
        return () => domElementGetter(sspaProps);
    }
    return defaultDomElementGetter(sspaProps);
}

function defaultDomElementGetter(sspaProps: SingleSpaProps) {
    // Where is "appName" coming from?  Must figure out if the type should include "appName" as a property.
    const appName = sspaProps.appName || sspaProps.name;
    if (!appName) {
        throw new Error(
            `single-spa-svelte was not given an application name as a prop, so it can't make a unique dom element container for the svelte application.`,
        );
    }
    const htmlId = `single-spa-application:${appName}`;

    return function defaultDomEl() {
        let domElement = document.getElementById(htmlId);
        if (!domElement) {
            domElement = document.createElement("div");
            domElement.id = htmlId;
            document.body.appendChild(domElement);
        }
        return domElement;
    };
}

export default singleSpaSvelte;
