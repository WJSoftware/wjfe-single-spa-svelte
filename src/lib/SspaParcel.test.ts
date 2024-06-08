import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte/svelte5';
import { SspaParcel } from './index.js';
import { mountRootParcel } from 'single-spa';
import type { SingleSpaProps } from './wjfe-single-spa-svelte.js';
import { tick } from 'svelte';

describe('SspaParcel', () => {
    test('Should throw an error if mountParcel is not provided.', () => {
        // Arrange.
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn()
        };

        // Act.
        // @ts-expect-error
        const act = () => render(SspaParcel, { sspa: { config } });

        // Assert.
        expect(act).toThrow();
    });
    test('Should throw an error if config is not provided.', () => {
        // Act.
        // @ts-expect-error
        const act = () => render(SspaParcel, { sspa: { mountParcel: vi.fn() } });

        // Assert.
        expect(act).toThrow();
    });
    test("Should call the given mountParcel() function upon rendering.", () => {
        // Arrange.
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(),
            unmount: vi.fn(),
            update: vi.fn()
        };
        const mountParcel = vi.fn();

        // Act.
        render(SspaParcel, { sspa: { config, mountParcel } });

        // Assert.
        // expect(config.mount).toHaveBeenCalledOnce();
        expect(mountParcel).toHaveBeenCalledOnce();
    });
    test("Should include the domElement property when calling the config's mount() function.", async () => {
        // Arrange.
        let sspaProps = {} as SingleSpaProps;
        let syncPromiseRslv: Function;
        const syncPromise = new Promise<void>((rslv, rjct) => {
            syncPromiseRslv = rslv;
        });
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(x => {
                sspaProps = x;
                syncPromiseRslv();
                return Promise.resolve();
            }),
            unmount: vi.fn(),
            update: vi.fn()
        };
        config.bootstrap.mockReturnValue(Promise.resolve());
        config.unmount.mockReturnValue(Promise.resolve());

        // Act.
        const component = render(SspaParcel, { sspa: { config, mountParcel: mountRootParcel } });
        await syncPromise;

        // Assert.
        expect(sspaProps.domElement).toBeTruthy();
    });
    test("Should include any extra properties when calling the config's mount() function.", async () => {
        // Arrange.
        let sspaProps = {} as SingleSpaProps;
        let syncPromiseRslv: Function;
        const syncPromise = new Promise<void>((rslv, rjct) => {
            syncPromiseRslv = rslv;
        });
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(x => {
                sspaProps = x;
                syncPromiseRslv();
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
        const component = render(SspaParcel, { sspa: { config, mountParcel: mountRootParcel }, ...props });
        await syncPromise;

        // Assert.
        for (let [k, v] of Object.entries(props)) {
            expect(sspaProps[k]).toEqual(v);
        }
    });
    // There seems to be a bug on the rerender() method that causes the component to unmount.
    test.skip("Should call update() whenever extra properties change their values.", async () => {
        // Arrange.
        let sspaProps: SingleSpaProps;
        let updatedProps: Record<string, any>;
        let syncMountPromiseRslv: Function;
        const syncMountPromise = new Promise<void>((rslv, rjct) => {
            syncMountPromiseRslv = rslv;
        });
        let syncUpdatePromiseRslv: Function;
        const syncUpdatePromise = new Promise<void>((rslv, rjct) => {
            syncUpdatePromiseRslv = rslv;
        });
        const config = {
            bootstrap: vi.fn(),
            mount: vi.fn(x => {
                sspaProps = x;
                sspaProps.singleSpa = {};
                delete sspaProps.domElement;
                syncMountPromiseRslv();
                return Promise.resolve();
            }),
            unmount: vi.fn(),
            update: vi.fn(x => {
                updatedProps = x;
                syncUpdatePromiseRslv();
                return Promise.resolve();
            })
        };
        config.bootstrap.mockReturnValue(Promise.resolve());
        // config.unmount.mockReturnValue(Promise.resolve());
        const props = {
            a: 1,
            b: true
        };
        const newProps = {
            a: 2,
            b: false
        };
        const component = render(SspaParcel, { sspa: { config, mountParcel: mountRootParcel }, ...props });
        await syncMountPromise;

        // Act.
        // await component.rerender({ sspa: { config, mountParcel: mountRootParcel }, ...newProps });
        // await syncUpdatePromise;

        // Assert.
        for (let [k, v] of Object.entries(newProps)) {
            // @ts-expect-error
            expect(updatedProps[k]).toEqual(v);
        }
    });
});
