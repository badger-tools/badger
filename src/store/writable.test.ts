import { afterEach, describe, expect, it, vi } from "vitest";

import { writable } from "./writable";

describe("writable", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should have public accessor", () => {
		const data = 42;
		const result = writable(data);
		expect(result.value).toEqual(data);
	});

	describe("set", () => {
		it("should allow the user to set the value", () => {
			const data = 42;
			const result = writable(data);

			expect(result.value).toEqual(data);

			result.set(0);
			expect(result.value).toEqual(0);
		});
	});

	describe("update", () => {
		it("should allow changing the value with an update method", () => {
			const data = 42;
			const result = writable(data);
			expect(result.value).toEqual(data);
			result.update((oldValue) => {
				expect(oldValue).toEqual(data);
				return 0;
			});
			expect(result.value).toEqual(0);
		});

		it("should not call update on a store with undefined value", () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = writable<number>(undefined as any);
			const mock = vi.fn();
			result.update(mock);
			expect(mock).not.toHaveBeenCalled();
		});
	});

	describe("subscribe", () => {
		it("should notify all subscribers of a value change", () => {
			const data = 42;
			const result = writable(data);

			const mock = vi.fn();
			const unsub = result.subscribe(mock);
			// the listener is expected to be called immediately, and any time that
			// the value changes
			expect(mock).toHaveBeenCalledWith(data);
			result.set(1234);
			expect(mock).toHaveBeenCalledWith(1234);

			unsub();
			// The listener should _not_ be called after the unsubscribe happens.
			result.set(1);
			expect(mock).toHaveBeenCalledTimes(2);
		});
	});

	describe("options", () => {
		it("should allow passing `shouldUpdate` in the options", () => {
			const obj = { id: "1234", name: "Waffles" };
			const shouldUpdate = (a: typeof obj, b: typeof obj) => {
				return a.id !== b.id;
			};
			const result = writable(obj, { shouldUpdate });
			expect(result.value).toEqual(obj);

			const mock = vi.fn();
			const unsub = result.subscribe(mock);
			expect(mock).toHaveBeenCalledWith(obj);

			// should not change, if the shouldUpdate conditions aren't met
			result.set({ id: "1234", name: "Asdf" });
			result.update((oldVal) => ({
				id: oldVal.id,
				name: "Fdsa",
			}));
			expect(mock).toHaveBeenCalledTimes(1);
			unsub();
		});
	});
});
