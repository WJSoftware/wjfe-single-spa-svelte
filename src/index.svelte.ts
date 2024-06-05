import { mount, unmount } from "svelte";
import { type Component } from "svelte";

type Options<TProps extends Record<string, any>, TExports extends Record<string, any> = Record<string, any>> = Parameters<typeof mount<TProps, TExports>>['1'];

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

export default function <TProps extends Record<string, any>>(component: Component<TProps>, options: Options<TProps>) {
    const thisValue = new SvelteLifeCycle<TProps>();

    function mountComponent(this: SvelteLifeCycle<TProps>) {
        this.props = options.props;
        this.instance = mount(component, { ...options, props: this.props });
        return Promise.resolve();
    }

    function unmountComponent(this: SvelteLifeCycle<TProps>) {
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
};
