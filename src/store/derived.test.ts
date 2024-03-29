import { describe, expect, it, vi } from "vitest";

import { derived } from "./derived";
import { writable } from "./writable";

describe("derived", () => {
	it("should create and use existing count store value", () => {
		const count = writable<number>(1);
		const result = derived<typeof count, number>(count, ($count, set) => {
			set($count * 2);
		});

		// should have a value
		expect(result.value).toEqual(2);

		// updating the count value, updates the derived value
		const mock = vi.fn();
		const unsub = result.subscribe(mock);

		count.set(2);
		expect(mock).toHaveBeenCalledWith(4);
		expect(result.value).toEqual(4);

		unsub();
		count.set(4);
		expect(mock).toHaveBeenCalledTimes(2);
		expect(result.value).toEqual(8);
	});

	it("should work with multiple store", () => {
		const count = writable<number>(1);
		const multiplyBy = writable<number>(2);
		const result = derived<[typeof count, typeof multiplyBy], number>(
			[count, multiplyBy],
			([$count, $multiplyBy], set) => {
				set($count * $multiplyBy);
			},
		);
		// updating the count value, updates the derived value
		const mock = vi.fn();
		const unsub = result.subscribe(mock);
		expect(mock).toHaveBeenCalledWith(2);
		expect(mock).toHaveBeenCalledTimes(1);
		count.update((c) => c + 1);
		expect(mock).toHaveBeenCalledTimes(2);
		multiplyBy.set(4);
		expect(mock).toHaveBeenCalledTimes(3);
		expect(result.value).toEqual(8);
		unsub();
		count.set(10);
		multiplyBy.set(10);
		expect(mock).toHaveBeenCalledTimes(3);
		expect(result.value).toEqual(100);
	});
});

it("should allow passing a 'shouldUpdate' function", () => {
	const user = writable({ id: "1234", name: "Asdf", notes: "" });
	const result = derived<typeof user, { id: string; name: string }>(
		user,
		($user, set) => {
			set({ id: $user.id, name: $user.name });
		},
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			shouldUpdate: (a: any, b: any) => {
				return a.id !== b.id || a.name !== b.name;
			},
		},
	);

	// should have a value
	expect(result.value).toEqual({ id: "1234", name: "Asdf" });

	// updating the count value, updates the derived value
	const mock = vi.fn();
	const unsub = result.subscribe(mock);

	user.set({ id: "1234", name: "Asdf", notes: "some note added here..." });
	expect(mock).toHaveBeenCalledTimes(1);
	expect(result.value).toEqual({ id: "1234", name: "Asdf" });
	user.set({ id: "1234", name: "Fdsa", notes: "some note added here..." });
	expect(mock).toHaveBeenCalledTimes(2);

	unsub();
	user.set({ id: "1234", name: "Waffles", notes: "" });
	expect(mock).toHaveBeenCalledTimes(2);
	// a derived store will ALWAYS have the latest data from it's parent stores,
	// but that value will only be emitted to subscribers
	expect(result.value).toEqual({ id: "1234", name: "Waffles" });
});
