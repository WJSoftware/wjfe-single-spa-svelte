import { singleSpaContextKey } from '$lib/singleSpaContext.js';
import SspaParcel from '$lib/SspaParcel/SspaParcel.svelte';
import { delay } from '$lib/utils.js';
import { render } from '@testing-library/svelte';
import { mountRootParcel } from 'single-spa';
import { describe, expect, test, vi } from 'vitest';
import type { SingleSpaProps } from '../wjfe-single-spa-svelte.js';

describe('SspaParcel', () => {
    test("Should obtain the mountParcel function from context.", () => {
        // Arrange.
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn()
        };
        const mountParcel = vi.fn();

        // Act.
        render(SspaParcel, { context: new Map([[singleSpaContextKey, { mountParcel }]]), props: { sspa: { config } } });

        // Assert.
        expect(mountParcel).toHaveBeenCalledOnce();
    });
    test("Should default to the mountRootParcel function from the library in context when mountParcel is not found.", () => {
        // Arrange.
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn()
        };
        const mountRootParcel = vi.fn();

        // Act.
        render(
            SspaParcel,
            {
                context: new Map([[singleSpaContextKey, { library: { mountRootParcel } }]]),
                props: { sspa: { config } }
            });

        // Assert.
        expect(mountRootParcel).toHaveBeenCalledOnce();
    });
    test('Should throw an error if mountParcel is not found in context.', () => {
        // Arrange.
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn()
        };

        // Act.
        const act = () => render(SspaParcel, { sspa: { config } });

        // Assert.
        expect(act).toThrow();
    });
    test('Should throw an error if config is not provided.', () => {
        // Act.
        // @ts-expect-error ts2741 The purpose of the test is to test for the missing prop.
        const act = () => render(SspaParcel, { sspa: {} });

        // Assert.
        expect(act).toThrow();
    });
    test("Should include the domElement property when calling the config's mount() function.", async () => {
        // Arrange.
        let sspaProps = {} as SingleSpaProps;
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(x => {
                sspaProps = x;
                return Promise.resolve();
            }),
            unmount: vi.fn(),
            update: vi.fn()
        };
        config.bootstrap.mockReturnValue(Promise.resolve());
        config.unmount.mockReturnValue(Promise.resolve());

        // Act.
        render(SspaParcel, {
            context: new Map([[singleSpaContextKey, { mountParcel: mountRootParcel }]]),
            props: { sspa: { config } }
        });
        await delay(0);

        // Assert.
        expect(sspaProps.domElement).toBeTruthy();
    });
    test("Should include any extra properties when calling the config's mount() function.", async () => {
        // Arrange.
        let sspaProps = {} as SingleSpaProps;
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(x => {
                sspaProps = x;
                return Promise.resolve();
            }),
            unmount: vi.fn(),
            update: vi.fn()
        };
        config.bootstrap.mockReturnValue(Promise.resolve());
        config.unmount.mockReturnValue(Promise.resolve());
        const props = {
            a: 1,
            b: true
        };

        // Act.
        render(SspaParcel, {
            context: new Map([[singleSpaContextKey, { mountParcel: mountRootParcel }]]),
            props: { sspa: { config }, ...props }
        });
        await delay(0);

        // Assert.
        for (let [k, v] of Object.entries(props)) {
            expect(sspaProps[k]).toEqual(v);
        }
    });
    test("Should call update() whenever extra properties change their values.", async () => {
        // Arrange.
        let sspaProps: SingleSpaProps;
        let updatedProps: Record<string, any>;
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(x => {
                sspaProps = x;
                sspaProps.singleSpa = {};
                delete sspaProps.domElement;
                return Promise.resolve();
            }),
            unmount: vi.fn(),
            update: vi.fn(x => {
                updatedProps = x;
                return Promise.resolve();
            })
        };
        config.bootstrap.mockReturnValue(Promise.resolve());
        config.unmount.mockReturnValue(Promise.resolve());
        const props = {
            a: 1,
            b: true
        };
        const newProps = {
            a: 2,
            b: false
        };
        const component = render(SspaParcel, {
            context: new Map([[singleSpaContextKey, { mountParcel: mountRootParcel }]]),
            props: { sspa: { config }, ...props }
        });

        // Act.
        await component.rerender({ ...newProps });
        await delay(0);

        // Assert.
        for (let [k, v] of Object.entries(newProps)) {
            // @ts-expect-error
            expect(updatedProps?.[k]).toEqual(v);
        }
    });
    test("Should spread any properties defined in sspa.containerProps on the container DIV element.", async () => {
        // Arrange.
        const config = {
            bootstrap: vi.fn(() => Promise.resolve()),
            mount: vi.fn(() => Promise.resolve()),
            unmount: vi.fn(() => Promise.resolve()),
            update: vi.fn(() => Promise.resolve())
        };
        const containerProps = {
            class: 'abc',
            'data-testid': 'def'
        };

        // Act.
        const { findByTestId } = render(SspaParcel, {
            context: new Map([[singleSpaContextKey, { mountParcel: mountRootParcel }]]),
            props: {
                sspa: { config, containerProps }
            }
        });

        // Assert.
        const container = await findByTestId(containerProps['data-testid']);
        expect(container).toBeTruthy();
        expect(container.classList.contains(containerProps.class)).toBeTruthy();
    });
});
