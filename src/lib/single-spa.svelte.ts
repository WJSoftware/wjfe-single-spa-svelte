import { mount, unmount } from "svelte";
import { type Component } from "svelte";

/**
 * Defines the function signature of all single-spa's lifecycle functions.
 *
 * **IMPORTANT**:  This should come from the single-spa package's types.  Remove once referencing
 * single-spa is possible.
 */
export type LifecycleFunction<TProps extends Record<string, any>> = (sspaProps: SingleSpaProps<TProps>) => Promise<void>;

export type DomElementGetterFunction<TProps extends Record<string, any>> = (props: SingleSpaProps<TProps>) => HTMLElement;

/**
 * Defines the single-spa lifecycle functions.
 *
 * **IMPORTANT**:  This should come from the single-spa package's types.  Remove once referencing
 * single-spa is possible.
 */
export type SspaLifeCycles<TProps extends Record<string, any>> = {
    bootstrap: LifecycleFunction<TProps>;
    mount: LifecycleFunction<TProps>;
    unmount: LifecycleFunction<TProps>;
    update?: (props: TProps) => Promise<void>;
};

/**
 * Defines the properties that single-spa inject to every mounted component.
 *
 * **IMPORTANT**:  This should come from the single-spa package's types.  Remove once referencing
 * single-spa is possible.
 */
export type SingleSpaProps<TProps extends Record<string, any>> = TProps & {
    name: string;
    singleSpa: Record<string, any>;
    mountParcel: (
        configFn: () => Promise<SspaLifeCycles<TProps>>,
        props: Record<string, any>,
    ) => any;
    domElement?: HTMLElement;
    domElementGetter?: DomElementGetterFunction<TProps>;
};

/**
 * Svelte options for Svelte's `mount()` function.
 */
export type SvelteOptions<TProps extends Record<string, any>, TExports extends Record<string, any> = Record<string, any>> = Omit<Parameters<typeof mount<TProps, TExports>>['1'], 'target'>;

/**
 * Class used to track single-spa instances.
 */
class SvelteLifeCycle<TProps extends Record<string, any>> {
    #instance?: object;
    props = $state<TProps>();

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
function singleSpaSvelte<TProps extends Record<string, any>>(
    component: Component<TProps>,
    domElementGetter?: DomElementGetterFunction<TProps>,
    svelteOptions?: SvelteOptions<TProps>
): SspaLifeCycles<TProps> {
    const thisValue = new SvelteLifeCycle<TProps>();

    function mountComponent(this: SvelteLifeCycle<TProps>, props: SingleSpaProps<TProps>) {
        const mergedProps = {
            ...svelteOptions?.props,
            ...props
        };
        delete mergedProps.domElement;
        delete mergedProps.domElementGetter;
        this.props = mergedProps;
        const target = chooseDomElementGetter(props, domElementGetter)();
        this.instance = mount(component, { ...svelteOptions, target, props: this.props });
        return Promise.resolve();
    }

    function unmountComponent(this: SvelteLifeCycle<TProps>, props: SingleSpaProps<TProps>) {
        if (!this.instance) {
            throw new Error('Cannot unmount.  There is no component to unmount.');
        }
        unmount(this.instance);
        this.instance = undefined;
        this.props = undefined;
        return Promise.resolve();
    }

    function updateComponent(this: SvelteLifeCycle<TProps>, newProps: TProps) {
        this.props = newProps;
        return Promise.resolve();
    }

    return {
        bootstrap: () => Promise.resolve(),
        mount: mountComponent.bind(thisValue),
        unmount: unmountComponent.bind(thisValue),
        update: updateComponent.bind(thisValue)
    };
}

function chooseDomElementGetter<TProps extends Record<string, any>>(
    sspaProps: SingleSpaProps<TProps>,
    domElementGetter?: DomElementGetterFunction<TProps>
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

function defaultDomElementGetter<TProps extends Record<string, any>>(sspaProps: SingleSpaProps<TProps>) {
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
