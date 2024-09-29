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
    test('Should throw an error if options.svelteOptions define the "target" property.', () => {
        // Arrange.
        let didThrow = false;

        // Act.
        try {
            //@ts-expect-error The target property is disallowed in svelteOptions.
            singleSpaSvelte(TestComponent, undefined, { svelteOptions: { target: {} } });
        }
        catch {
            didThrow = true;
        }

        // Assert.
        expect(didThrow).toEqual(true);
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
        test("Should call Svelte's mount().", async () => {
            // Arrange.
            const mountProps: SvelteOptions<ComponentProps<typeof TestComponent>> = {
                props: {
                    propA: true
                }
            };
            const lc = singleSpaSvelte(TestComponent, undefined, { svelteOptions: mountProps });

            // Act.
            await lc.mount({
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
        test('Should call preMount before mounting the component.', async () => {
            // Arrange.
            const sspaProps = {
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {}
            };
            let mountCalled = false;
            let preMountCalledBeforeMount = false;
            const preMount = () => {
                preMountCalledBeforeMount = !mountCalled
            };
            mountMock.mockImplementation(() => mountCalled = true);
            mountMock.mockResolvedValue({});
            const lc = singleSpaSvelte(TestComponent, undefined, { preMount });

            // Act.
            await lc.mount(sspaProps);

            // Assert.
            expect(preMountCalledBeforeMount).toEqual(true);
        });
        test('Should reject the promise if preMount throws.', async () => {
            // Arrange.
            const sspaProps = {
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {}
            };
            const preMount = () => {
                throw new Error('preMount did this to you!');
            };
            mountMock.mockResolvedValue({});
            const lc = singleSpaSvelte(TestComponent, undefined, { preMount });
            let didThrow = false;

            // Act.
            try {
                await lc.mount(sspaProps);
            }
            catch {
                didThrow = true;
            }

            // Assert.
            expect(didThrow).toEqual(true);
        });
        test('Should store the single-spa library instance and the mountParcel function in context.', async () => {
            // Arrange.
            const sspaProps = {
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {
                    mountRootParcel: vi.fn()
                }
            };
            const lc = singleSpaSvelteFactory()(TestComponent);

            // Act.
            await lc.mount(sspaProps);
            // Clean-up.
            await lc.unmount(sspaProps);

            // Assert.
            expect(sspaProps.mountParcel).toHaveBeenCalledOnce();
            expect(sspaProps.singleSpa.mountRootParcel).toHaveBeenCalledOnce();
        });
        test('Should store the single-spa library instance and the mountParcel function in the incoming context.', async () => {
            // Arrange.
            const sspaProps = {
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {
                    mountRootParcel: vi.fn()
                }
            };
            const extraContext = vi.fn();
            const context = new Map([
                ["extra", extraContext]
            ]);
            const lc = singleSpaSvelteFactory()(TestComponent, undefined, { svelteOptions: { context }});

            // Act.
            await lc.mount(sspaProps);
            // Clean-up.
            await lc.unmount(sspaProps);

            // Assert.
            expect(sspaProps.mountParcel).toHaveBeenCalledOnce();
            expect(sspaProps.singleSpa.mountRootParcel).toHaveBeenCalledOnce();
            expect(extraContext).toHaveBeenCalledOnce();
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
        test('Should call postUnmount after unmounting the component.', async () => {
            // Arrange.
            const sspaProps = {
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {}
            };
            mountMock.mockResolvedValue({});
            let unmountCalled = false;
            let postUnmountCalledAfterUnmount = false;
            const postUnmount = () => {
                postUnmountCalledAfterUnmount = unmountCalled
            };
            unmountMock.mockImplementation(() => unmountCalled = true);
            const lc = singleSpaSvelte(TestComponent, undefined, { postUnmount });
            await lc.mount(sspaProps);

            // Act.
            await lc.unmount(sspaProps);

            // Assert.
            expect(postUnmountCalledAfterUnmount).toEqual(true);
        });
        test('Should reject the promise if postUmount throws.', async () => {
            // Arrange.
            const sspaProps = {
                mountParcel: vi.fn(),
                name: 'the-name',
                singleSpa: {}
            };
            mountMock.mockResolvedValue({});
            const postUnmount = () => {
                throw new Error('postUmount did this to you!');
            };
            const lc = singleSpaSvelte(TestComponent, undefined, { postUnmount });
            await lc.mount(sspaProps);
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
            // Clean-up.
            await lc.unmount(sspaProps);
        });
    });
});