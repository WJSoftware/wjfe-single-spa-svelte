import { screen } from '@testing-library/svelte';
import { type ComponentProps } from 'svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { SvelteOptions } from '../wjfe-single-spa-svelte.js';
import singleSpaSvelteFactory from './single-spa.svelte.js';
import TestComponent from './TestComponent.test.svelte';

const mountMock = vi.fn();
const unmountMock = vi.fn();
const singleSpaSvelte = singleSpaSvelteFactory(mountMock, unmountMock);

describe('singleSpaSvelte', () => {
    beforeEach(() => {
        mountMock.mockReset();
        unmountMock.mockReset();
    });
    test('Should throw an error if a component is not given to it.', () => {
        // Act.
        // @ts-expect-error
        const act = () => singleSpaSvelte();

        // Assert.
        expect(act).toThrow();
    });
    test('Should return an object with all 4 single-spa lifecycles.', () => {
        // Act.
        const lc = singleSpaSvelte(TestComponent);

        // Assert.
        expect(lc).toBeTruthy();
        expect(lc.bootstrap).toBeTypeOf('function');
        expect(lc.mount).toBeTypeOf('function');
        expect(lc.unmount).toBeTypeOf('function');
        expect(lc.update).toBeTypeOf('function');
    });

    describe('mount', () => {
        test('Should return a promise that successfully resolves upon mounting the component.', async () => {
            // Arrange.
            const lc = singleSpaSvelte(TestComponent);
            const result = lc.mount({
                mountParcel: vi.fn(),
                name: 'mifeA',
                singleSpa: {},
            });
            let didThrow = false;
            
            // Act.
            try {
                await result;
            }
            catch {
                didThrow = true;
            }

            // Assert.
            expect(result).toBeInstanceOf(Promise);
            expect(didThrow).toEqual(false);
        });
        test('Should return a promise that fails upon failing to mount the component.', async () => {
            // Arrange.
            mountMock.mockImplementationOnce(() => { throw new Error('Error!'); });
            const lc = singleSpaSvelte(TestComponent);
            const result = lc.mount({
                mountParcel: vi.fn(),
                name: 'mifeA',
                singleSpa: {},
            });
            let didThrow = false;
            
            // Act.
            try {
                await result;
            }
            catch {
                didThrow = true;
            }

            // Assert.
            expect(result).toBeInstanceOf(Promise);
            expect(didThrow).toEqual(true);
        });
        test("Should call Svelte's mount().", () => {
            // Arrange.
            const mountProps: SvelteOptions<ComponentProps<TestComponent>> = {
                props: {
                    propA: true
                }
            };
            const lc = singleSpaSvelte(TestComponent, undefined, mountProps);

            // Act.
            lc.mount({
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {}
            });

            // Assert.
            expect(mountMock).toHaveBeenCalledOnce();
        });
        test('Should throw an error if the component is already mounted.', async () => {
            // Arrange.
            const sspaProps = {
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {}
            };
            const lc = singleSpaSvelte(TestComponent);
            mountMock.mockResolvedValue({});
            await lc.mount(sspaProps);
            let didThrow = false;

            // Act.
            try {
                await lc.mount(sspaProps);
            }
            catch {
                didThrow = true;
            }

            expect(didThrow).toEqual(true);
        });
    });
    describe('unmount', () => {
        test('Should throw an error if called when there is nothing mounted.', async () => {
            // Arrange.
            const lc = singleSpaSvelte(TestComponent);
            let didThrow = false;

            // Act.
            try {
                await lc.unmount({
                    mountParcel: vi.fn(),
                    name: 'the-name',
                    singleSpa: {}
                });
            }
            catch {
                didThrow = true;
            }

            // Assert.
            expect(didThrow).toEqual(true);
        });
        test("Should call Svelte's unmount().", async () => {
            // Arrange.
            const sspaProps = {
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {}
            };
            mountMock.mockResolvedValue({});
            const lc = singleSpaSvelte(TestComponent);
            await lc.mount(sspaProps);

            // Act.
            await lc.unmount(sspaProps);

            // Assert.
            expect(unmountMock).toHaveBeenCalledOnce();
        });

        test('Should throw an error if the component is unmounted after it was unmounted without mounting it again.', async () => {
            // Arrange.
            const sspaProps = {
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {}
            };
            mountMock.mockResolvedValue({});
            const lc = singleSpaSvelte(TestComponent);
            await lc.mount(sspaProps);
            await lc.unmount(sspaProps);
            let didThrow = false;

            // Act.
            try {
                await lc.unmount(sspaProps);
            }
            catch {
                didThrow = true;
            }

            // Assert.
            expect(didThrow).toEqual(true);
        });
    });
    describe('update', () => {
        test('Should throw an error if called when the component has not been mounted.', async () => {
            // Arrange.
            const lc = singleSpaSvelte(TestComponent);
            let didThrow = false;

            // Act.
            try {
                await lc.update!({
                    propA: true
                });
            }
            catch {
                didThrow = true;
            }

            // Assert.
            expect(didThrow).toEqual(true);
        });
        test('Should pass the updated properties to the component.', async () => {
            // Arrange.
            const sspaProps = {
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {}
            };
            const lc = singleSpaSvelteFactory()(TestComponent);
            await lc.mount({
                mountParcel: vi.fn(),
                name: 'mife01',
                singleSpa: {},
                propA: false
            });

            // Act.
            await lc.update!({ propA: true });

            // Assert.
            const element = screen.getByRole('alert');
            expect(element.getAttribute('data-propA')).toEqual("true");
        });
    });
});