import { describe, expect, it, vi } from "vitest";

import { buildStorage } from "./storage";
import { afterEach } from "node:test";

type TestCase = {
	description: string;
	storage?: any;
	expected: any;
};

describe("buildStorage", () => {
	const cases: TestCase[] = [
		{
			description: "should return undefined if storage is not provided",
			storage: undefined,
			expected: undefined,
		},
		{
			description: "should return undefined if storage is not a storage engine",
			storage: {},
			expected: undefined,
		},
		{
			description: "should return storage engine if storage is a storage engine",
			storage: {
				engine: "localStorage",
				key: "test",
			},
			expected: {
				key: "test",
				getItem: expect.any(Function),
				setItem: expect.any(Function),
				removeItem: expect.any(Function),
			},
		},
	];

	cases.forEach((t) => {
		it(t.description, () => {
			const result = buildStorage(t.storage);
			expect(result).toEqual(t.expected);
		});
	});

	describe("mocking Storage", () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("should return localStorage or sessionStorage", () => {
			const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
			const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
			const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
			const storage = {
				engine: "sessionStorage",
				key: "test",
			} as any;

			const result = buildStorage(storage);
			expect(result).toBeDefined();
			result?.getItem('test');
			result?.setItem('test', 'value');
			result?.removeItem('test');
			expect(getItemSpy).toHaveBeenCalledWith('test');
			// internal storage implementation wraps all values in JSON.stringify
			expect(setItemSpy).toHaveBeenCalledWith('test', JSON.stringify('value'));
			expect(removeItemSpy).toHaveBeenCalledWith('test');
		});

		it("should only run JSON.parse if the value is a string", () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => 42 as any);
			const storage = {
				engine: "localStorage",
				key: "test",
			} as any;

			const result = buildStorage(storage);
			const value = result?.getItem('test');
			expect(value).toBe(42);
		});

		it("should return null if JSON.parse fails", () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => "invalid JSON" as any);
			const storage = {
				engine: "localStorage",
				key: "test",
			} as any;
			const result = buildStorage(storage);
			const value = result?.getItem('test');
			expect(value).toBe(null);
		});
	});
});
