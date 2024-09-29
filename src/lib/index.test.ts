import { describe, expect, test } from "vitest";

describe('index', () => {
    test("Should export exactly the expected objects.", async () => {
        // Arrange.
        const expectedList = [
            'getSingleSpaContext',
            'SspaParcel',
            'singleSpaSvelte'
        ];

        // Act.
        const lib = await import('./index.js');

        // Assert.
        for (let item of expectedList) {
            expect(item in lib, `The expected object ${item} is not exported.`).toEqual(true);
        }
        for (let key of Object.keys(lib)) {
            expect(expectedList.includes(key), `The library exports object ${key}, which is not expected.`).toEqual(true);
        }
    });
});
