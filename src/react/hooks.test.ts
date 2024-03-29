import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { writable } from "../store";

import { useStore } from "./hooks";

describe("useStore", () => {
	it("should update when the store changes", () => {
		const store = writable(42);
		const { result } = renderHook(() => useStore(store));

		expect(result.current).toBe(42);

		act(() => {
			store.set(8);
		});

		expect(result.current).toBe(8);
	});
});
